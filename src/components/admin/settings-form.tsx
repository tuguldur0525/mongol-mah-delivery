"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SettingsForm({
  settings,
}: {
  settings: {
    store_name: string;
    contact_phone: string;
    delivery_fee: number;
    delivery_info: string;
  };
}) {
  const router = useRouter();
  const [values, setValues] = useState(settings);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, start] = useTransition();

  const handleSave = () => {
    setError(null);
    setSuccess(false);
    start(async () => {
      const supabase = createClient();
      const { error: e } = await supabase
        .from("store_settings")
        .update({
          store_name: values.store_name,
          contact_phone: values.contact_phone,
          delivery_fee: Number(values.delivery_fee),
          delivery_info: values.delivery_info || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1);
      if (e) setError("Хадгалахад алдаа гарлаа");
      else {
        setSuccess(true);
        router.refresh();
      }
    });
  };

  const set = (k: keyof typeof values, v: string) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="mt-6 rounded-md border border-line bg-surface p-5">
      <h2 className="text-[0.6875rem] font-bold uppercase tracking-widest text-bone">
        Дэлгүүрийн мэдээлэл
      </h2>
      <div className="mt-4 space-y-4">
        <div>
          <label>Дэлгүүрийн нэр</label>
          <input
            value={values.store_name}
            onChange={(e) => set("store_name", e.target.value)}
          />
        </div>
        <div>
          <label>Холбоо барих утас</label>
          <input
            value={values.contact_phone}
            onChange={(e) => set("contact_phone", e.target.value)}
          />
        </div>
        <div>
          <label>Хүргэлтийн төлбөр (₮)</label>
          <input
            type="number"
            min={0}
            value={values.delivery_fee}
            onChange={(e) => set("delivery_fee", e.target.value)}
          />
        </div>
        <div>
          <label>Хүргэлтийн мэдээлэл</label>
          <textarea
            rows={3}
            value={values.delivery_info}
            onChange={(e) => set("delivery_info", e.target.value)}
            placeholder="Хот дотор 09:00-20:00 хүргэнэ."
          />
        </div>
      </div>
      {error && (
        <div className="mt-4 rounded-sm border border-blood/30 bg-blood/10 px-4 py-3 text-sm text-cream">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-sm border border-fresh/30 bg-fresh/10 px-4 py-3 text-sm text-cream">
          Хадгалагдлаа
        </div>
      )}
      <button onClick={handleSave} disabled={pending} className="btn-primary mt-4 w-full">
        {pending ? "Хадгалж байна..." : "Хадгалах"}
      </button>
    </div>
  );
}
