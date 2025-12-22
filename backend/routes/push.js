const express = require('express');
const router = express.Router();
const { supabase } = require('../db/supabase');

// Store or update device token for native push (FCM/APNs)
router.post('/register', async (req, res) => {
  try {
    const userId = req.session?.userId || req.body.userId || null;
    const { token, platform } = req.body;
    if (!token) return res.status(400).json({ error: 'Missing token' });

    // upsert into device_tokens table
    const payload = {
      user_id: userId,
      token,
      platform: platform || null,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('device_tokens')
      .upsert(payload, { onConflict: ['token'] });

    if (error) {
      console.error('Failed to upsert device token:', error);
      return res.status(500).json({ error: 'Failed to save token' });
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error('Register token error', e);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Test sending a notification: accepts { userId } or { token }
router.post('/test', async (req, res) => {
  try {
    const { userId, token, title, body } = req.body;
    const payload = { title: title || 'Test', body: body || 'This is a test notification' };
    const { sendNotif } = require('../notifications');

    if (userId) {
      await sendNotif(userId, payload);
      return res.json({ ok: true, sentTo: 'user', userId });
    }

    if (token) {
      // send directly via firebase-admin if available
      try {
        const admin = require('firebase-admin');
        await admin.messaging().send({ token, notification: payload });
        return res.json({ ok: true, sentTo: 'token' });
      } catch (e) {
        console.error('Direct send failed', e);
        return res.status(500).json({ error: 'Direct send failed', detail: e.message || e });
      }
    }

    return res.status(400).json({ error: 'Provide userId or token' });
  } catch (e) {
    console.error('Push test failed', e);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
