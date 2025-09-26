"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Landmark, Percent, CalendarClock, Repeat } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";

const formSchema = z.object({
  principal: z.coerce.number().positive({ message: "Principal amount must be greater than 0." }),
  rate: z.coerce.number().positive({ message: "Interest rate must be greater than 0." }).max(100, { message: "Interest rate cannot be more than 100%." }),
  years: z.coerce.number().positive({ message: "Tenure must be greater than 0." }),
  compounding: z.enum(['annually', 'half-yearly', 'quarterly', 'monthly']),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  maturityValue: number;
  totalInterest: number;
  principal: number;
}

export default function FdCalculator() {
  const [results, setResults] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      principal: 100000,
      rate: 6.5,
      years: 5,
      compounding: "annually",
    },
  });

  const compoundingPeriods = {
    monthly: 12,
    quarterly: 4,
    'half-yearly': 2,
    annually: 1,
  };

  function onSubmit(values: FormValues) {
    const { principal, rate, years, compounding } = values;
    const n = compoundingPeriods[compounding];
    const r = rate / 100;

    const maturityValue = principal * Math.pow(1 + r / n, n * years);
    const totalInterest = maturityValue - principal;

    setResults({
      maturityValue,
      totalInterest,
      principal,
    });
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  
  const chartConfig = {
    principal: { label: "Principal", color: "hsl(var(--secondary))" },
    interest: { label: "Interest", color: "hsl(var(--accent))" },
  } satisfies ChartConfig;

  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8 w-full max-w-6xl">
      <div className="w-full lg:w-1/2">
        <Card className="w-full shadow-lg border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary">FD Calculator</CardTitle>
            <CardDescription>Estimate the returns on your Fixed Deposit</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="principal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Principal Amount</FormLabel>
                      <div className="relative">
                        <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input type="number" step="any" placeholder="e.g., 100000" className="pl-10" {...field} />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Interest Rate (%)</FormLabel>
                      <div className="relative">
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input type="number" step="0.01" placeholder="e.g., 6.5" className="pl-10" {...field} />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="years"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tenure (in years)</FormLabel>
                      <div className="relative">
                        <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input type="number" step="0.1" placeholder="e.g., 5" className="pl-10" {...field} />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="compounding"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compounding Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <div className="relative">
                              <Repeat className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <SelectTrigger className="pl-10">
                                <SelectValue placeholder="Select compounding frequency" />
                              </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="annually">Annually</SelectItem>
                          <SelectItem value="half-yearly">Half-Yearly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  Calculate
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
      
      <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
        {results && (
          <div className="w-full animate-in fade-in-0 zoom-in-95 duration-500">
              <Card className="shadow-lg border-primary/20">
                  <CardHeader>
                      <CardTitle className="text-center text-2xl font-bold text-primary">Results</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                      <div className="md:col-span-3 space-y-3">
                          <div className="flex justify-between items-baseline p-3 bg-secondary rounded-lg">
                              <span className="text-sm text-muted-foreground">Invested Amount</span>
                              <span className="font-semibold text-base">{formatCurrency(results.principal)}</span>
                          </div>
                           <div className="flex justify-between items-baseline p-3 bg-secondary rounded-lg">
                              <span className="text-sm text-muted-foreground">Total Interest</span>
                              <span className="font-semibold text-base text-accent">{formatCurrency(results.totalInterest)}</span>
                          </div>
                           <div className="flex justify-between items-baseline p-4 bg-primary/10 rounded-lg border border-primary/20">
                              <span className="text-sm text-primary font-medium">Maturity Value</span>
                              <span className="font-bold text-lg text-primary">{formatCurrency(results.maturityValue)}</span>
                          </div>
                      </div>
                      <div className="md:col-span-2">
                          <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[180px]">
                              <PieChart>
                                  <ChartTooltip
                                      cursor={false}
                                      content={<ChartTooltipContent indicator="dot" hideLabel />}
                                  />
                                  <Pie
                                      data={[
                                          { name: "principal", value: results.principal },
                                          { name: "interest", value: results.totalInterest }
                                      ]}
                                      dataKey="value"
                                      nameKey="name"
                                      innerRadius={50}
                                      strokeWidth={2}
                                  />
                                  <ChartLegend
                                      content={<ChartLegendContent nameKey="name" />}
                                      className="-mt-4"
                                  />
                              </PieChart>
                          </ChartContainer>
                      </div>
                  </CardContent>
              </Card>
          </div>
        )}
      </div>
    </div>
  );
}
