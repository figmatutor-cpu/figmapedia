interface PaymentRow {
  id: string;
  toss_order_id: string;
  plan_type: "monthly" | "annual";
  amount: number;
  status: string;
  paid_at: string;
  receipt_url: string | null;
}

interface Props {
  payments: PaymentRow[];
}

function fmtDate(v: string): string {
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;
    return d.toLocaleDateString("ko-KR");
  } catch {
    return v;
  }
}

function fmtAmount(amount: number): string {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  done: {
    label: "완료",
    className: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
  },
  cancelled: {
    label: "취소",
    className: "border-border-1 bg-glass-1 text-fg-3",
  },
  refunded: {
    label: "환불",
    className: "border-red-500/30 bg-status-danger/10 text-red-300",
  },
};

export function BillingHistoryTable({ payments }: Props) {
  if (payments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border-1 bg-glass-1 p-8 text-center">
        <p className="text-meta text-fg-4">결제 내역이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border-1 bg-glass-2">
      <table className="w-full text-body">
        <thead>
          <tr className="border-b border-border-1 text-xxs uppercase tracking-widest text-fg-4">
            <th className="px-4 py-3 text-left font-medium">결제일</th>
            <th className="px-4 py-3 text-left font-medium">플랜</th>
            <th className="px-4 py-3 text-right font-medium">금액</th>
            <th className="px-4 py-3 text-center font-medium">상태</th>
            <th className="px-4 py-3 text-right font-medium">영수증</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => {
            const status = STATUS_LABEL[p.status] ?? {
              label: p.status,
              className: "border-border-1 bg-glass-1 text-fg-3",
            };
            return (
              <tr key={p.id} className="border-b border-border-1 last:border-0">
                <td className="px-4 py-3 text-fg-2">{fmtDate(p.paid_at)}</td>
                <td className="px-4 py-3 text-fg-2">
                  {p.plan_type === "annual" ? "연간" : "월간"}
                </td>
                <td className="px-4 py-3 text-right text-fg-2">
                  {fmtAmount(p.amount)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-xxs ${status.className}`}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {p.receipt_url ? (
                    <a
                      href={p.receipt_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-meta text-brand-blue-light hover:underline"
                    >
                      보기
                    </a>
                  ) : (
                    <span className="text-xxs text-fg-5">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
