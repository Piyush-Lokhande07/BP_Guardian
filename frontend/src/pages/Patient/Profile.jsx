import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import Card from '../../components/Card'
import Input from '../../components/Input'
import { User, Mail, Phone, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function Profile() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    bloodGroup: '',
    address: '',
    zipcode: '',
    medicalHistoryText: ''
  })
  const [originalForm, setOriginalForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
  const response = await api.get('/users/me')
      if (response.data.success) {
        const user = response.data.data
        const formData = {
          fullName: user.fullName || '',
          email: user.email || '',
          phone: user.phone || '',
          age: user.age || '',
          gender: user.gender || '',
          height: user.height || '',
          weight: user.weight || '',
          bloodGroup: user.bloodGroup || '',
          address: user.address || '',
          zipcode: user.zipcode || '',
          medicalHistoryText: user.medicalHistoryText || ''
        }
        setForm(formData)
        setOriginalForm({ ...formData })
      }
    } catch (err) {
      setError('Failed to load profile')
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const update = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value })
  }

  const saveChanges = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Don't update email, password, or role
      const { email, ...updateData } = form
      
  const response = await api.put('/users/me', updateData)

      if (response.data.success) {
        setOriginalForm({ ...form })
        setSuccess('Profile updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
      console.error('Error updating profile:', err)
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = JSON.stringify(form) !== JSON.stringify(originalForm)

  if (loading) {
    return (
      <Card title="Patient Profile">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card title="Personal Information">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        <div className="grid gap-4 max-w-2xl">
          <Input
            label="Full Name"
            value={form.fullName}
            onChange={update('fullName')}
            left={<User className="w-4 h-4 text-slate-400" />}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            disabled
            left={<Mail className="w-4 h-4 text-slate-400" />}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={update('phone')}
            left={<Phone className="w-4 h-4 text-slate-400" />}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Age"
              type="number"
              value={form.age}
              onChange={update('age')}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                value={form.gender}
                onChange={update('gender')}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Height (cm)"
              type="number"
              value={form.height}
              onChange={update('height')}
            />
            <Input
              label="Weight (kg)"
              type="number"
              value={form.weight}
              onChange={update('weight')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
            <select
              value={form.bloodGroup}
              onChange={update('bloodGroup')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select blood group</option>
              <option>O+</option>
              <option>O-</option>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
            </select>
          </div>
          <Input
            label="Address"
            value={form.address}
            onChange={update('address')}
          />
          <Input
            label="Zipcode"
            value={form.zipcode}
            onChange={update('zipcode')}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Medical History</label>
            <textarea
              value={form.medicalHistoryText}
              onChange={update('medicalHistoryText')}
              rows={4}
              className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your medical history..."
            />
          </div>
          <div>
            <button
              onClick={saveChanges}
              disabled={saving || !hasChanges}
              className="px-4 py-2 rounded-lg bg-linear-to-r from-blue-500 to-teal-500 text-white hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
