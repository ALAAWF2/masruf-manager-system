import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExpenses } from "@/contexts/ExpenseContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ExpenseFormPage() {
  const navigate = useNavigate();
  const { addExpense } = useExpenses();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !amount || !description) return;

    setSubmitting(true);

    // عند تفعيل Firebase Storage، استبدل هذا الجزء برفع الملفات فعليًا
    const fakeAttachmentURLs =
      files && files.length > 0
        ? Array.from(files).map((file) => `mock://file/${file.name}`)
        : [];

    await addExpense({
      title,
      amount: parseFloat(amount),
      description,
      attachments: fakeAttachmentURLs // مؤقتاً مسارات وهمية
    });

    setSubmitting(false);
    navigate("/");
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">إضافة طلب صرف</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="العنوان"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              placeholder="المبلغ"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Textarea
              placeholder="الوصف"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                المرفقات (صور / فواتير):
              </label>
              <Input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={(e) => setFiles(e.target.files)}
              />
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? "جاري الإرسال..." : "إرسال الطلب"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
