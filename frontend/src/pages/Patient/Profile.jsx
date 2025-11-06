import React, { useState } from 'react'
import Card from '../../components/Card'
import Input from '../../components/Input'
import { User, Mail, Phone } from 'lucide-react'

export default function Profile() {
  const [form, setForm] = useState({ name:'John Doe', email:'john@example.com', phone:'' })
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <Card title="Patient Profile">
      <div className="grid gap-4 max-w-xl">
        <Input label="Full Name" value={form.name} onChange={update('name')} left={<User className="w-4 h-4 text-slate-400"/>} />
        <Input label="Email" value={form.email} onChange={update('email')} left={<Mail className="w-4 h-4 text-slate-400"/>} />
        <Input label="Phone" value={form.phone} onChange={update('phone')} left={<Phone className="w-4 h-4 text-slate-400"/>} />
        <div>
          <button className="px-4 py-2 rounded-lg bg-linear-to-r from-blue-500 to-teal-500 text-white">Save Changes</button>
        </div>
      </div>
    </Card>
  )
}
