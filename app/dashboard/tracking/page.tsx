"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { HabitPlan, Habit } from "@/app/types/assessment";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClipboardList, TrendingUp, Calendar, Target } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type MeResponse = {
  isPremium: boolean;
  tier: "free" | "premium";
  evaluationCount: number;
  freeLimit: number;
  freeRemaining: number;
};

export default function TrackingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<HabitPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = useCallback(async () => {
    try {
      const meRes = await fetch("/api/me");
      if (!meRes.ok) {
        if (meRes.status === 401) {
          router.push("/auth");
          return;
        }
        throw new Error("Error al cargar el usuario");
      }

      const meData = (await meRes.json()) as MeResponse;
      setMe(meData);

      // Premium: load full history. Free: load only latest plan.
      const response = await fetch(
        meData.isPremium ? "/api/plans?all=1" : "/api/plans"
      );

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/auth");
          return;
        }
        if (response.status === 403) {
          // History is premium-only; free users should not hit this if UI is correct.
          setError("Premium requerido para ver el historial.");
          setLoading(false);
          return;
        }
        if (response.status === 404) {
          setError("No hay evaluaciones previas");
        } else {
          throw new Error("Error al cargar el plan");
        }
        setLoading(false);
        return;
      }

      const data = (await response.json()) as HabitPlan | HabitPlan[];
      const plansArray = Array.isArray(data) ? data : [data];
      setPlans(plansArray);
      setSelectedPlanId(plansArray?.[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === selectedPlanId) ?? null,
    [plans, selectedPlanId]
  );

  const planForMetrics = useMemo(() => {
    return selectedPlan ?? plans[0] ?? null;
  }, [selectedPlan, plans]);

  const sortedPlansAsc = useMemo(() => {
    if (!me?.isPremium) return [];

    return [...plans]
      .map((p) => ({
        plan: p,
        ts: Number.isFinite(new Date(p.createdAt).getTime())
          ? new Date(p.createdAt).getTime()
          : 0,
      }))
      .sort((a, b) => a.ts - b.ts)
      .map((x) => x.plan);
  }, [me?.isPremium, plans]);

  const sortedPlansDesc = useMemo(() => {
    return [...plans]
      .map((p) => ({
        plan: p,
        ts: Number.isFinite(new Date(p.createdAt).getTime())
          ? new Date(p.createdAt).getTime()
          : 0,
      }))
      .sort((a, b) => b.ts - a.ts)
      .map((x) => x.plan);
  }, [plans]);

  const latestPlan = useMemo(
    () => sortedPlansDesc[0] ?? null,
    [sortedPlansDesc]
  );

  const selectedTs = useMemo(() => {
    if (!planForMetrics?.createdAt) return null;
    const ts = new Date(planForMetrics.createdAt).getTime();
    return Number.isFinite(ts) ? ts : null;
  }, [planForMetrics?.createdAt]);

  const latestTs = useMemo(() => {
    if (!latestPlan?.createdAt) return null;
    const ts = new Date(latestPlan.createdAt).getTime();
    return Number.isFinite(ts) ? ts : null;
  }, [latestPlan?.createdAt]);

  const progressSeries = useMemo(() => {
    if (!me?.isPremium) return [];

    return sortedPlansAsc.map((p) => {
      const ts = Number.isFinite(new Date(p.createdAt).getTime())
        ? new Date(p.createdAt).getTime()
        : 0;

      return {
        ts,
        wellbeing: p.assessment.wellbeingScore,
        stress: p.assessment.stressLevel,
        sleep: p.assessment.sleepRepairScore,
        exercise: p.assessment.exerciseFrequencyPerWeek,
        habits: p.habits.length,
        highHabits: p.habits.filter((h) => h.priority === "high").length,
      };
    });
  }, [me?.isPremium, sortedPlansAsc]);

  const chartConfig = {
    wellbeing: {
      label: "Bienestar",
      color: "hsl(var(--primary))",
    },
    stress: {
      label: "Estrés (↓ mejor)",
      color: "hsl(var(--destructive))",
    },
    sleep: {
      label: "Sueño reparador",
      color: "hsl(var(--ring))",
    },
    exercise: {
      label: "Ejercicio/sem",
      color: "hsl(var(--muted-foreground))",
    },
  } satisfies ChartConfig;

  const formatTooltipLabel = useCallback((raw: string | number | undefined) => {
    const ts = typeof raw === "number" ? raw : Number(raw);
    if (!Number.isFinite(ts)) return String(raw ?? "");
    return new Date(ts).toLocaleDateString("es", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  }, []);

  const formatTooltipValue = useCallback(
    (key: string, raw: number | string | undefined) => {
      if (raw == null) return "";
      const value = typeof raw === "number" ? raw : Number(raw);
      if (!Number.isFinite(value)) return String(raw);

      if (key === "exercise") return `${value}/sem`;
      if (key === "wellbeing" || key === "stress" || key === "sleep") {
        return `${value}/10`;
      }
      return String(value);
    },
    []
  );

  const formatDeltaValue = useCallback((key: string, raw: number) => {
    const rounded = Math.round(raw * 10) / 10;
    const sign = rounded >= 0 ? "+" : "";

    if (key === "exercise") return `${sign}${rounded}/sem`;
    if (key === "wellbeing" || key === "stress" || key === "sleep") {
      return `${sign}${rounded}/10`;
    }
    return `${sign}${rounded}`;
  }, []);

  // Comparison against historical baseline (premium only):
  // - Prefer average of evaluations BEFORE the selected one.
  // - If there are none, fall back to average of all other evaluations.
  const comparisonBaselinePlans = useMemo(() => {
    if (!me?.isPremium) return [] as HabitPlan[];
    if (!planForMetrics?.id) return [] as HabitPlan[];
    if (!selectedTs) return [] as HabitPlan[];

    const prior = sortedPlansAsc.filter((p) => {
      const ts = new Date(p.createdAt).getTime();
      return Number.isFinite(ts) && ts < selectedTs;
    });

    if (prior.length > 0) return prior;
    return sortedPlansAsc.filter((p) => p.id !== planForMetrics.id);
  }, [me?.isPremium, planForMetrics?.id, selectedTs, sortedPlansAsc]);

  const comparisonLabel = useMemo(() => {
    if (!me?.isPremium) return null;
    if (!planForMetrics?.id || !selectedTs) return null;

    const hasPrior = sortedPlansAsc.some((p) => {
      const ts = new Date(p.createdAt).getTime();
      return (
        Number.isFinite(ts) && ts < selectedTs && p.id !== planForMetrics.id
      );
    });

    return hasPrior ? "vs promedio previo" : "vs promedio histórico";
  }, [me?.isPremium, planForMetrics?.id, selectedTs, sortedPlansAsc]);

  const historicalAverage = useMemo(() => {
    if (!me?.isPremium) return null;
    if (!comparisonBaselinePlans.length) return null;

    const sums = comparisonBaselinePlans.reduce(
      (acc, p) => {
        acc.wellbeing += p.assessment.wellbeingScore;
        acc.stress += p.assessment.stressLevel;
        acc.sleep += p.assessment.sleepRepairScore;
        acc.exercise += p.assessment.exerciseFrequencyPerWeek;
        acc.habits += p.habits.length;
        acc.highHabits += p.habits.filter((h) => h.priority === "high").length;
        return acc;
      },
      {
        wellbeing: 0,
        stress: 0,
        sleep: 0,
        exercise: 0,
        habits: 0,
        highHabits: 0,
      }
    );

    const n = comparisonBaselinePlans.length;
    return {
      wellbeing: sums.wellbeing / n,
      stress: sums.stress / n,
      sleep: sums.sleep / n,
      exercise: sums.exercise / n,
      habits: sums.habits / n,
      highHabits: sums.highHabits / n,
    };
  }, [comparisonBaselinePlans, me?.isPremium]);

  const delta = useMemo(() => {
    if (!me?.isPremium || !historicalAverage || !planForMetrics) return null;

    const baselineHabits = Math.round(historicalAverage.habits);
    const baselineHighHabits = Math.round(historicalAverage.highHabits);

    return {
      habits: planForMetrics.habits.length - baselineHabits,
      highHabits:
        planForMetrics.habits.filter((h) => h.priority === "high").length -
        baselineHighHabits,
      wellbeing:
        planForMetrics.assessment.wellbeingScore - historicalAverage.wellbeing,
      stress: planForMetrics.assessment.stressLevel - historicalAverage.stress,
      sleep:
        planForMetrics.assessment.sleepRepairScore - historicalAverage.sleep,
      exercise:
        planForMetrics.assessment.exerciseFrequencyPerWeek -
        historicalAverage.exercise,
    };
  }, [historicalAverage, me?.isPremium, planForMetrics]);

  const selectedPlanIndexDesc = useMemo(() => {
    if (!planForMetrics?.id) return -1;
    return sortedPlansDesc.findIndex((p) => p.id === planForMetrics.id);
  }, [planForMetrics?.id, sortedPlansDesc]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto"></div>
          <p className="text-gray-600">Cargando plan de hábitos...</p>
        </div>
      </div>
    );
  }

  if (error || plans.length === 0) {
    return (
      <div className="max-w-2xl mx-auto animate-slide-up">
        <Card className="border-2">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="h-8 w-8 text-gray-400" />
            </div>
            <CardTitle className="text-2xl">
              No hay evaluaciones previas
            </CardTitle>
            <CardDescription className="text-base">
              Realiza una evaluación para recibir tu plan personalizado de
              hábitos
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <Button
              className="bg-black hover:bg-gray-800 text-white"
              onClick={() => router.push("/dashboard/evaluation")}
              size="lg"
            >
              <ClipboardList className="w-4 h-4 mr-2 text-white" />
              Realizar Evaluación
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const plan = planForMetrics ?? plans[0];

  const highPriorityHabits = plan.habits.filter((h) => h.priority === "high");
  const mediumPriorityHabits = plan.habits.filter(
    (h) => h.priority === "medium"
  );
  const lowPriorityHabits = plan.habits.filter((h) => h.priority === "low");

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      {/* Plan tier */}
      {me && (
        <Card className="border-2 border-slate-100 dark:border-slate-700/50 rounded-xl">
          <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-slate-700 dark:text-slate-300">
              {me.isPremium ? (
                <span className="font-semibold">Plan Premium activo</span>
              ) : (
                <span>
                  <span className="font-semibold">Plan Free</span> —{" "}
                  {me.evaluationCount}/{me.freeLimit} evaluaciones usadas (
                  {me.freeRemaining} restantes)
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* History selector (Premium only) */}
      {me?.isPremium && (
        <Card className="border-2 border-slate-100 dark:border-slate-700/50 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Historial de evaluaciones
            </CardTitle>
            <CardDescription>
              Selecciona una evaluación para ver su plan de hábitos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {plans.map((p) => {
                const isActive = p.id === selectedPlanId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlanId(p.id ?? null)}
                    className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                      isActive
                        ? "border-primary bg-primary text-white"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {new Date(p.createdAt).toLocaleDateString("es", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Premium charts based on history */}
      {me?.isPremium && (
        <Card className="border-2 border-slate-100 dark:border-slate-700/50 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Progreso en el tiempo
            </CardTitle>
            <CardDescription>
              Visualización basada en tu historial de evaluaciones.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 pb-6">
            {progressSeries.length < 2 ? (
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Necesitas al menos 2 evaluaciones para ver el progreso.
              </div>
            ) : (
              <div className="space-y-4">
                {delta && (
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {comparisonLabel ?? "Comparación"}: Bienestar{" "}
                    {formatDeltaValue("wellbeing", delta.wellbeing)} • Estrés{" "}
                    {formatDeltaValue("stress", delta.stress)} (↓ mejor) • Sueño{" "}
                    {formatDeltaValue("sleep", delta.sleep)} • Ejercicio{" "}
                    {formatDeltaValue("exercise", delta.exercise)}
                  </div>
                )}
                <ChartContainer config={chartConfig} className="h-80 w-full">
                  <LineChart
                    data={progressSeries}
                    margin={{ left: 8, right: 8 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="hsl(var(--border))"
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="ts"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={14}
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 12,
                      }}
                      tickFormatter={(value) =>
                        new Date(Number(value)).toLocaleDateString("es", {
                          month: "short",
                          day: "2-digit",
                        })
                      }
                    />

                    <YAxis
                      yAxisId="score"
                      domain={[0, 10]}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 12,
                      }}
                    />

                    <YAxis
                      yAxisId="exercise"
                      orientation="right"
                      domain={[0, "auto"]}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 12,
                      }}
                    />

                    <Tooltip
                      content={
                        <ChartTooltipContent
                          config={chartConfig}
                          labelFormatter={formatTooltipLabel}
                          valueFormatter={formatTooltipValue}
                        />
                      }
                      cursor={{ stroke: "hsl(var(--border))" }}
                    />

                    <Legend
                      verticalAlign="top"
                      align="left"
                      wrapperStyle={{ paddingBottom: 8 }}
                      formatter={(value) => {
                        const key = String(value);
                        const cfg = (chartConfig as ChartConfig)[key];
                        return (
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            {cfg?.label ?? key}
                          </span>
                        );
                      }}
                    />

                    <Line
                      yAxisId="score"
                      type="monotone"
                      dataKey="wellbeing"
                      stroke="var(--color-wellbeing)"
                      strokeWidth={2}
                      dot={(p) => {
                        const t = p?.payload?.ts as number | undefined;
                        const isKey =
                          (selectedTs != null && t === selectedTs) ||
                          (latestTs != null && t === latestTs);
                        if (!isKey) return false;
                        return (
                          <circle
                            cx={p.cx}
                            cy={p.cy}
                            r={4}
                            fill="var(--color-wellbeing)"
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                          />
                        );
                      }}
                      activeDot={{ r: 5 }}
                    />

                    <Line
                      yAxisId="score"
                      type="monotone"
                      dataKey="stress"
                      stroke="var(--color-stress)"
                      strokeWidth={2}
                      dot={(p) => {
                        const t = p?.payload?.ts as number | undefined;
                        const isKey =
                          (selectedTs != null && t === selectedTs) ||
                          (latestTs != null && t === latestTs);
                        if (!isKey) return false;
                        return (
                          <circle
                            cx={p.cx}
                            cy={p.cy}
                            r={4}
                            fill="var(--color-stress)"
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                          />
                        );
                      }}
                      activeDot={{ r: 5 }}
                    />

                    <Line
                      yAxisId="score"
                      type="monotone"
                      dataKey="sleep"
                      stroke="var(--color-sleep)"
                      strokeWidth={2}
                      dot={(p) => {
                        const t = p?.payload?.ts as number | undefined;
                        const isKey =
                          (selectedTs != null && t === selectedTs) ||
                          (latestTs != null && t === latestTs);
                        if (!isKey) return false;
                        return (
                          <circle
                            cx={p.cx}
                            cy={p.cy}
                            r={4}
                            fill="var(--color-sleep)"
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                          />
                        );
                      }}
                      activeDot={{ r: 5 }}
                    />

                    <Line
                      yAxisId="exercise"
                      type="monotone"
                      dataKey="exercise"
                      stroke="var(--color-exercise)"
                      strokeWidth={2}
                      dot={(p) => {
                        const t = p?.payload?.ts as number | undefined;
                        const isKey =
                          (selectedTs != null && t === selectedTs) ||
                          (latestTs != null && t === latestTs);
                        if (!isKey) return false;
                        return (
                          <circle
                            cx={p.cx}
                            cy={p.cy}
                            r={4}
                            fill="var(--color-exercise)"
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                          />
                        );
                      }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Header Summary Card */}
      <Card className="border-2 border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-linear-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Tu Plan de Hábitos Personalizado
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base font-medium">
                Generado el{" "}
                {new Date(plan.createdAt).toLocaleDateString("es", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/evaluation")}
              className="border-2 border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600 hover:border-blue-600 transition-all w-full sm:w-auto"
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Nueva Evaluación
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
            {plan.summary}
          </p>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-2 border-slate-100 dark:border-slate-700/50 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all rounded-xl">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
              Total de Hábitos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 sm:gap-3">
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {plan.habits.length}
              </span>
            </div>
            {me?.isPremium && (
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                {comparisonLabel && delta
                  ? `${comparisonLabel}: ${delta.habits >= 0 ? "+" : ""}${
                      delta.habits
                    }`
                  : "Sin comparación"}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-100 dark:border-slate-700/50 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all rounded-xl">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
              Alta Prioridad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 dark:text-red-400" />
              <span className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">
                {highPriorityHabits.length}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              {plan.habits.length > 0
                ? `${Math.round(
                    (highPriorityHabits.length / plan.habits.length) * 100
                  )}% del total`
                : "0% del total"}
              {me?.isPremium && comparisonLabel && delta && (
                <span>
                  {` • ${comparisonLabel}: ${delta.highHabits >= 0 ? "+" : ""}${
                    delta.highHabits
                  }`}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-100 dark:border-slate-700/50 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all rounded-xl sm:col-span-2 md:col-span-1">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
              Última Actualización
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
              <span className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                {new Date(plan.createdAt).toLocaleDateString("es")}
              </span>
            </div>
            {me?.isPremium && sortedPlansDesc.length > 0 && (
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                {selectedPlanIndexDesc >= 0
                  ? `Evaluación ${selectedPlanIndexDesc + 1} de ${
                      sortedPlansDesc.length
                    }`
                  : ""}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* High Priority Habits */}
      {highPriorityHabits.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full"></span>
            Hábitos de Alta Prioridad
          </h2>
          <div className="space-y-4">
            {highPriorityHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        </div>
      )}

      {/* Medium Priority Habits */}
      {mediumPriorityHabits.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            Hábitos de Media Prioridad
          </h2>
          <div className="space-y-4">
            {mediumPriorityHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        </div>
      )}

      {/* Low Priority Habits */}
      {lowPriorityHabits.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            Hábitos de Baja Prioridad
          </h2>
          <div className="space-y-4">
            {lowPriorityHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HabitCard({ habit }: { habit: Habit }) {
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
      case "low":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600";
    }
  };

  const getBorderColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 dark:border-l-red-400";
      case "medium":
        return "border-l-yellow-500 dark:border-l-yellow-400";
      case "low":
        return "border-l-green-500 dark:border-l-green-400";
      default:
        return "border-l-gray-500 dark:border-l-slate-500";
    }
  };

  return (
    <Card
      className={`border-l-4 ${getBorderColor(
        habit.priority
      )} border border-slate-100 dark:border-slate-700/50 rounded-xl shadow-sm hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
              {habit.title}
            </CardTitle>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityBadgeColor(
              habit.priority
            )}`}
          >
            {habit.priority === "high"
              ? "Alta Prioridad"
              : habit.priority === "medium"
              ? "Media Prioridad"
              : "Baja Prioridad"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          {habit.description}
        </p>

        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-sm border border-blue-200 dark:border-blue-800 font-medium">
            📁 {habit.category}
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 rounded-full text-sm border border-purple-200 dark:border-purple-800 font-medium">
            📅 {habit.frequency}
          </span>
          {habit.timeOfDay && (
            <span className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 rounded-full text-sm border border-orange-200 dark:border-orange-800 font-medium">
              🕐 {habit.timeOfDay}
            </span>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            <strong className="text-slate-900 dark:text-white">
              💡 Por qué es importante:
            </strong>{" "}
            {habit.reasoning}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
