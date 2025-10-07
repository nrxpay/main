import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CryptoTx {
  id: string;
  crypto_type: string;
  crypto_symbol: string;
  quantity: number;
  rate_inr: number;
  total_inr: number;
  transaction_id: string;
  status: string;
  created_at: string;
}

export function CryptoExchangeHistory() {
  const { user } = useAuth();
  const [txs, setTxs] = useState<CryptoTx[]>([]);
  const [loading, setLoading] = useState(true);
  
  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  const fetchTxs = async () => {
    if (!user) {
      setTxs([]);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("crypto_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTxs(data || []);
    } catch (e) {
      setTxs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTxs();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("crypto-transactions-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "crypto_transactions", filter: `user_id=eq.${user.id}` },
        () => fetchTxs()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const StatusBadge = ({ status }: { status: string }) => {
    const s = status.toLowerCase();
    const variant = s === "approved" ? "success" : s === "rejected" ? "destructive" : "secondary";
    return <Badge variant={variant as any} className="capitalize">{status}</Badge>;
  };

  if (loading) {
    return (
      <Card className="p-4 text-sm text-muted-foreground">Loading crypto exchange history...</Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-foreground">Crypto Exchange History</h3>
      {txs.length === 0 ? (
        <Card className="p-4 text-sm text-muted-foreground">No crypto exchange transactions yet</Card>
      ) : (
        <div className="space-y-3">
          {txs.map((t) => (
            <Card key={t.id} className="p-4 border border-gray-200 shadow-sm rounded-xl">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold capitalize text-foreground">
                    {t.crypto_type}
                    <span className="uppercase text-[10px] text-muted-foreground ml-2">{t.crypto_symbol}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Txn ID: {t.transaction_id}</p>
                  <p className="text-[11px] text-muted-foreground">{formatDate(t.created_at)}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-lg font-bold text-foreground">₹{Number(t.total_inr).toLocaleString("en-IN")}</p>
                  <p className="text-xs text-muted-foreground">{t.quantity} {t.crypto_symbol}</p>
                  <div className="flex justify-end"><StatusBadge status={t.status} /></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}



