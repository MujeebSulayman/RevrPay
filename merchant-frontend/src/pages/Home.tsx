import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  CreditCard,
  Users,
  TrendingUp,
  ArrowUpRight,
  Activity,
  Clock,
  Plus
} from 'lucide-react';
import { api, type Transaction, type TransactionStats } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  date: string;
  revenue: number;
}

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState<string>('there');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TransactionStats>({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    cancelled: 0,
    totalAmount: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [activeCustomers, setActiveCustomers] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [revenueChange, setRevenueChange] = useState(0);
  const [transactionChange, setTransactionChange] = useState(0);
  const [customerChange, setCustomerChange] = useState(0);
  const [conversionChange, setConversionChange] = useState(0);

  // Fetch user profile and dashboard data
  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch user profile for display name
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', user.id)
          .single();

        if (profile?.display_name) {
          setDisplayName(profile.display_name);
        } else if (user.email) {
          setDisplayName(user.email.split('@')[0]);
        }

        // Fetch transactions with stats
        const transactionsResponse = await api.getTransactions({ limit: 100 });

        if (transactionsResponse.success) {
          const transactions = transactionsResponse.transactions;
          const transactionStats = transactionsResponse.stats;

          setStats(transactionStats);
          setRecentTransactions(transactions.slice(0, 5));

          // Calculate active customers (unique customer_ids)
          const uniqueCustomers = new Set(
            transactions
              .filter((tx: Transaction) => tx.customer_id)
              .map((tx: Transaction) => tx.customer_id)
          );
          setActiveCustomers(uniqueCustomers.size);

          // Calculate conversion rate (completed / total)
          const total = transactionStats.total || 1;
          const completed = transactionStats.completed || 0;
          const conversion = (completed / total) * 100;
          setConversionRate(conversion);

          // Generate chart data from last 7 days
          const now = new Date();
          const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(now);
            date.setDate(date.getDate() - (6 - i));
            return date.toISOString().split('T')[0];
          });

          const dailyRevenue = last7Days.map((date: string) => {
            const dayTransactions = transactions.filter((tx: Transaction) => {
              const txDate = new Date(tx.created_at).toISOString().split('T')[0];
              return txDate === date && tx.status === 'completed';
            });
            const revenue = dayTransactions.reduce((sum: number, tx: Transaction) => sum + (tx.amount || 0), 0);
            return {
              date,
              revenue: Math.round(revenue * 100) / 100,
            };
          });

          setChartData(dailyRevenue);

          // Calculate changes (comparing last 7 days vs previous 7 days)
          const last7DaysTransactions = transactions.filter((tx: Transaction) => {
            const txDate = new Date(tx.created_at);
            return txDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          });

          const previous7DaysTransactions = transactions.filter((tx: Transaction) => {
            const txDate = new Date(tx.created_at);
            return txDate >= new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) &&
              txDate < new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          });

          const last7Revenue = last7DaysTransactions
            .filter((tx: Transaction) => tx.status === 'completed')
            .reduce((sum: number, tx: Transaction) => sum + (tx.amount || 0), 0);

          const prev7Revenue = previous7DaysTransactions
            .filter((tx: Transaction) => tx.status === 'completed')
            .reduce((sum: number, tx: Transaction) => sum + (tx.amount || 0), 0);

          const last7Count = last7DaysTransactions.length;
          const prev7Count = previous7DaysTransactions.length;

          const last7Customers = new Set(
            last7DaysTransactions.filter((tx: Transaction) => tx.customer_id).map((tx: Transaction) => tx.customer_id)
          ).size;
          const prev7Customers = new Set(
            previous7DaysTransactions.filter((tx: Transaction) => tx.customer_id).map((tx: Transaction) => tx.customer_id)
          ).size;

          const last7Conversion = last7Count > 0
            ? (last7DaysTransactions.filter((tx: Transaction) => tx.status === 'completed').length / last7Count) * 100
            : 0;
          const prev7Conversion = prev7Count > 0
            ? (previous7DaysTransactions.filter((tx: Transaction) => tx.status === 'completed').length / prev7Count) * 100
            : 0;

          setRevenueChange(prev7Revenue > 0 ? ((last7Revenue - prev7Revenue) / prev7Revenue) * 100 : 0);
          setTransactionChange(prev7Count > 0 ? ((last7Count - prev7Count) / prev7Count) * 100 : 0);
          setCustomerChange(prev7Customers > 0 ? ((last7Customers - prev7Customers) / prev7Customers) * 100 : 0);
          setConversionChange(prev7Conversion > 0 ? ((last7Conversion - prev7Conversion) / prev7Conversion) * 100 : 0);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {displayName}!</h1>
        <p className="text-muted-foreground">
          Here's an overview of your payment activity and business metrics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={revenueChange}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="Transactions"
          value={stats.total.toLocaleString()}
          change={transactionChange}
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatCard
          title="Active Customers"
          value={activeCustomers.toLocaleString()}
          change={customerChange}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Conversion Rate"
          value={`${conversionRate.toFixed(1)}%`}
          change={conversionChange}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>
              Revenue over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis
                    className="text-xs"
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: number) => [`$${value}`, 'Revenue']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Latest payment activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">
                          {transaction.customer_id ? `Customer ${transaction.customer_id.slice(0, 8)}...` : 'Anonymous'}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {new Date(transaction.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        ${transaction.amount.toFixed(2)}
                      </p>
                      <StatusBadge status={transaction.status} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No transactions yet. Create a payment link to get started!
                </p>
              )}
            </div>
            {recentTransactions.length > 0 && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => navigate('/transactions')}
              >
                View All Transactions
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              variant="outline"
              className="h-auto p-4 flex-col items-start"
              onClick={() => navigate('/payment-links')}
            >
              <Plus className="mb-2 h-4 w-4" />
              <span>Create Payment Link</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex-col items-start"
              onClick={() => navigate('/transactions')}
            >
              <CreditCard className="mb-2 h-4 w-4" />
              <span>View All Transactions</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex-col items-start"
              onClick={() => navigate('/reporting')}
            >
              <Activity className="mb-2 h-4 w-4" />
              <span>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}