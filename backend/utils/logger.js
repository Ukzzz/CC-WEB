const Log = require('../models/Log');

/**
 * Create a system log entry
 * @param {Object} data - Log data
 * @param {string} data.action - Action name (e.g., 'LOGIN', 'CREATE_RESOURCE')
 * @param {string} data.user - User ID performing the action
 * @param {string|null} data.hospital - Hospital ID (optional)
 * @param {Object} data.details - JSON object with details
 * @param {Object} req - Express request object (optional, for IP/Agent)
 */
const createLog = async ({ action, user, hospital = null, details = {} }, req = null) => {
  try {
    const logData = {
      action,
      user,
      hospital,
      details,
    };

    if (req) {
      logData.ip = req.ip || req.connection.remoteAddress;
      logData.userAgent = req.get('User-Agent');
    }

    // Fire and forget - don't await to avoid blocking response
    Log.create(logData).catch(err => 
      console.error(`Failed to create log for ${action}:`, err)
    );
  } catch (error) {
    console.error('Logger error:', error);
  }
};

module.exports = { createLog };
