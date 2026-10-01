import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';
import { Link } from 'react-router-dom';

export default function SelectLoginType() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl"
      >
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-ink mb-4"
          >
            Welcome back to <span className="text-gradient-red">BloodLink</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted max-w-2xl mx-auto"
          >
            Choose how you'd like to sign in to your account
          </motion.p>
        </div>

        {/* User Type Selection Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8"
        >
          {/* Hospital Login Card */}
          <motion.button
            variants={itemVariants}
            onClick={() => navigate('/hospital/login')}
            className="group relative overflow-hidden rounded-2xl border-2 border-line bg-white p-8 transition-all duration-300 hover:border-red-300 hover:shadow-xl hover:shadow-red-500/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative">
              <div className="flex justify-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 group-hover:scale-110 transition-transform duration-300">
                  <Building2 size={32} />
                </div>
              </div>

              <h3 className="font-display text-2xl font-bold text-ink mb-2">
                Hospital
              </h3>
              <p className="text-sm text-muted mb-6">
                Access your hospital's blood request dashboard and manage donor matches
              </p>

              <div className="flex items-center justify-center gap-2 text-red-600 font-semibold group-hover:gap-3 transition-all duration-300">
                Sign In <ArrowRight size={18} />
              </div>
            </div>
          </motion.button>

          {/* Donor Login Card */}
          <motion.button
            variants={itemVariants}
            onClick={() => navigate('/login')}
            className="group relative overflow-hidden rounded-2xl border-2 border-line bg-white p-8 transition-all duration-300 hover:border-cyan-300 hover:shadow-xl hover:shadow-cyan-500/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative">
              <div className="flex justify-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600 group-hover:scale-110 transition-transform duration-300">
                  <Users size={32} />
                </div>
              </div>

              <h3 className="font-display text-2xl font-bold text-ink mb-2">
                Donor
              </h3>
              <p className="text-sm text-muted mb-6">
                View emergency requests, manage your profile, and help save lives
              </p>

              <div className="flex items-center justify-center gap-2 text-cyan-600 font-semibold group-hover:gap-3 transition-all duration-300">
                Sign In <ArrowRight size={18} />
              </div>
            </div>
          </motion.button>
        </motion.div>

        {/* Register Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-muted"
        >
          Don't have an account?{' '}
          <Link to="/auth/select-type" className="font-semibold text-red-600 hover:text-red-700 transition-colors">
            Create one now
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
