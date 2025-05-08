
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExpenses } from "@/contexts/ExpenseContext";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  expenseType: z.string().min(1, { message: "يجب اختيار نوع المصروف" }),
  details: z.string().min(5, { message: "يجب أن يحتوي التفاصيل على 5 أحرف على الأقل" }),
  amount: z.coerce.number().positive({ message: "يجب أن يكون المبلغ أكبر من صفر" }),
});

type FormValues = z.infer<typeof formSchema>;

const expenseTypes = [
  { value: "مصاريف سفر", label: "مصاريف سفر" },
  { value: "معدات مكتبية", label: "معدات مكتبية" },
  { value: "برامج وتطبيقات", label: "برامج وتطبيقات" },
  { value: "تدريب وتطوير", label: "تدريب وتطوير" },
  { value: "مستلزمات", label: "مستلزمات" },
  { value: "أخرى", label: "أخرى" },
];

const ExpenseFormPage = () => {
  const { addExpense } = useExpenses();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attachments, setAttachments] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expenseType: "",
      details: "",
      amount: 0,
    },
  });

  const onSubmit = (values: FormValues) => {
    if (!user) {
      return;
    }

    addExpense({
      employeeName: user.name,
      employeeId: user.id,
      department: user.department || "عام",
      expenseType: values.expenseType,
      details: values.details,
      amount: values.amount,
      attachments,
    });

    navigate("/expenses");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newAttachments = Array.from(e.target.files).map(file => file.name);
      setAttachments([...attachments, ...newAttachments]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>إنشاء طلب صرف جديد</CardTitle>
          <CardDescription>
            أدخل بيانات طلب الصرف الخاص بك. سيتم مراجعته من قبل المدير التنفيذي.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expenseType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع الصرف</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع الصرف" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {expenseTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المبلغ (ريال)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          placeholder="أدخل المبلغ" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>التفاصيل</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="أدخل تفاصيل وسبب الصرف" 
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>المرفقات</FormLabel>
                <div className="border rounded-md p-4 bg-muted/30">
                  <div className="flex flex-col space-y-2">
                    <Input 
                      type="file" 
                      onChange={handleFileChange}
                      multiple
                      className="bg-background"
                    />
                    <p className="text-xs text-muted-foreground">
                      يمكنك إرفاق إيصالات، فواتير، أو أي مستندات داعمة (الحد الأقصى: 10MB لكل ملف)
                    </p>
                  </div>
                  
                  {attachments.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium">الملفات المرفقة:</p>
                      <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                        {attachments.map((file, index) => (
                          <li key={index}>{file}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/expenses")}
              >
                إلغاء
              </Button>
              <Button type="submit">تقديم طلب الصرف</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default ExpenseFormPage;
