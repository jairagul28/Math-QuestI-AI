import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { User, Mail, Lock, Sparkles, GraduationCap, AlertCircle, ArrowRight } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    grade: 5,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Please enter student name';
    if (!formData.email.trim()) {
      errs.email = 'Please enter an email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (![5, 6].includes(Number(formData.grade))) {
      errs.grade = 'Please select either Grade 5 or Grade 6';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'grade' ? Number(value) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    setServerError('');
  };

  const handleGradeSelect = (selectedGrade) => {
    setFormData((prev) => ({ ...prev, grade: selectedGrade }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    const res = await register(formData);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setServerError(res.error || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-purple-600 text-white shadow-lg mb-2">
            <Sparkles className="w-7 h-7 text-amber-300 fill-amber-300" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Create Your Account
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Begin your gamified math quest aligned with Georgia Standards!
          </p>
        </div>

        <Card className="border-2 border-purple-100 shadow-xl">
          <CardContent className="p-6 sm:p-8">
            {serverError && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Grade Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Select Your Grade
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleGradeSelect(5)}
                    className={`p-3.5 rounded-2xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      formData.grade === 5
                        ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <GraduationCap className={`w-5 h-5 ${formData.grade === 5 ? 'text-purple-600' : 'text-slate-400'}`} />
                    <span>Grade 5</span>
                    <span className="text-[10px] text-slate-400 font-normal">Fractions & Decimals</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGradeSelect(6)}
                    className={`p-3.5 rounded-2xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      formData.grade === 6
                        ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <GraduationCap className={`w-5 h-5 ${formData.grade === 6 ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span>Grade 6</span>
                    <span className="text-[10px] text-slate-400 font-normal">Ratios & Division</span>
                  </button>
                </div>
              </div>

              {/* Student Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Student Name
                </label>
                <Input
                  name="name"
                  placeholder="e.g. Alex Rivera"
                  icon={User}
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  autoComplete="name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Email Address
                </label>
                <Input
                  name="email"
                  type="email"
                  placeholder="student@school.edu"
                  icon={Mail}
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Password
                </label>
                <Input
                  name="password"
                  type="password"
                  placeholder="At least 6 characters"
                  icon={Lock}
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  autoComplete="new-password"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Confirm Password
                </label>
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  icon={Lock}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  autoComplete="new-password"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="playful"
                  size="lg"
                  isLoading={loading}
                  className="w-full gap-2 text-base"
                >
                  <span>Start My Quest</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-600 font-bold hover:underline">
                Log In Here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;

