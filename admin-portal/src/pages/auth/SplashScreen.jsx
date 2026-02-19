import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LocalHospital } from '@mui/icons-material';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login', { replace: true });
    }, 6000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <motion.div
      className="splash-container"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Gradient Background */}
      <div className="splash-gradient">
        {/* Floating decorative elements */}
        <div className="splash-bg-shapes">
          <div className="splash-shape splash-shape-1" />
          <div className="splash-shape splash-shape-2" />
          <div className="splash-shape splash-shape-3" />
        </div>

        {/* Content */}
        <div className="splash-content">
          {/* Animated Hospital Icon */}
          <motion.div
            className="splash-icon-wrapper"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="splash-icon-circle">
              <LocalHospital style={{ fontSize: 56, color: '#ffffff' }} />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="splash-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
          >
            CareConnect
          </motion.h1>

          {/* Tagline */}
          <motion.p
            className="splash-tagline"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.4, ease: 'easeOut' }}
          >
            Finding care when you need it most
          </motion.p>

          {/* Loading Section */}
          <motion.div
            className="splash-loading-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.0 }}
          >
            {/* Progress Bar */}
            <div className="splash-progress-track">
              <motion.div
                className="splash-progress-fill"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 5.5, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>

            {/* Loading Text */}
            <motion.p
              className="splash-loading-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              transition={{ duration: 0.8, delay: 2.5 }}
            >
              Connecting to hospitals...
            </motion.p>
          </motion.div>
        </div>

        {/* Bottom Branding */}
        <motion.div
          className="splash-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 0.8, delay: 3.5 }}
        >
          <p>Admin Portal</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
