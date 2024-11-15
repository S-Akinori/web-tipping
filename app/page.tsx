'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function TippingService() {
  const [step, setStep] = useState(1)
  const [selectedStaff, setSelectedStaff] = useState('')
  const [tipAmount, setTipAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [message, setMessage] = useState('')

  const staff = [
    { id: '1', name: '山田 太郎' },
    { id: '2', name: '佐藤 花子' },
    { id: '3', name: '鈴木 一郎' },
  ]

  const handleTipSubmit = async () => {

    const stripe = await stripePromise;

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseInt(tipAmount, 10), name: selectedStaff, message }),
    });

    const session = await response.json();

    if (stripe) {
      const result = await stripe.redirectToCheckout({ sessionId: session.id });
      if (result.error) {
        console.error(result.error.message);
      }
    }
  };

  const handleNext = () => {
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>ウェブチップサービスへようこそ</CardTitle>
              <CardDescription>スタッフにチップを送りましょう</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={handleNext} className="w-full">開始</Button>
            </CardFooter>
          </Card>
        )
      case 2:
        return (
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>スタッフを選択</CardTitle>
              <CardDescription>チップを送るスタッフを選んでください</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedStaff} onValueChange={setSelectedStaff}>
                {staff.map((s) => (
                  <div key={s.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={s.id} id={s.id} />
                    <Label htmlFor={s.id}>{s.name}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={handleBack} variant="outline">戻る</Button>
              <Button onClick={handleNext} disabled={!selectedStaff}>次へ</Button>
            </CardFooter>
          </Card>
        )
      case 3:
        return (
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>チップ額を入力</CardTitle>
              <CardDescription>送りたいチップの金額を入力してください</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  placeholder="例: 500"
                />
                <span>円</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={handleBack} variant="outline">戻る</Button>
              <Button onClick={handleNext} disabled={!tipAmount}>次へ</Button>
            </CardFooter>
          </Card>
        )
      case 4:
        return (
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>決済方法を選択</CardTitle>
              <CardDescription>チップの支払い方法を選んでください</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credit" id="credit" />
                  <Label htmlFor="credit">クレジットカード</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paypay" id="paypay" />
                  <Label htmlFor="paypay">PayPay</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="linepay" id="linepay" />
                  <Label htmlFor="linepay">LINE Pay</Label>
                </div>
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={handleBack} variant="outline">戻る</Button>
              <Button onClick={handleNext} disabled={!paymentMethod}>次へ</Button>
            </CardFooter>
          </Card>
        )
      case 5:
        return (
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>メッセージを入力</CardTitle>
              <CardDescription>スタッフへのメッセージを入力してください（任意）</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="ありがとうございました！"
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={handleBack} variant="outline">戻る</Button>
              <Button onClick={handleNext}>完了</Button>
            </CardFooter>
          </Card>
        )
      case 6:
        return (
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>こちらの内容でよろしいですか？</CardTitle>
            </CardHeader>
            <CardContent>
              <p>スタッフ: {staff.find(s => s.id === selectedStaff)?.name}</p>
              <p>チップ額: {tipAmount}円</p>
              <p>決済方法: {paymentMethod}</p>
              {message && <p>メッセージ: {message}</p>}
            </CardContent>
            <CardFooter>
              <Button onClick={handleTipSubmit} className="w-full">チップを送る</Button>
            </CardFooter>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {renderStep()}
    </div>
  )
}