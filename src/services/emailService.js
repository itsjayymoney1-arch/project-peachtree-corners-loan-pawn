// Transactional & Marketing Email Service for Peachtree Corners Loan & Pawn
import { STORE_INFO } from '../data/storeInfo.js';
import { dbService } from './db.js';

// Luxury Black & Gold Email HTML Template Wrapper
function wrapLuxuryEmailTemplate(contentHtml, title = "Peachtree Corners Loan & Pawn") {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { margin: 0; padding: 0; background-color: #090909; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F6F2E9; }
        .wrapper { max-width: 600px; margin: 0 auto; background-color: #121212; border: 1px solid rgba(197, 161, 90, 0.3); border-radius: 4px; overflow: hidden; }
        .header { background-color: #090909; padding: 28px 24px; text-align: center; border-bottom: 2px solid #C5A15A; }
        .logo-text { font-size: 20px; font-weight: 700; letter-spacing: 0.15em; color: #C5A15A; text-transform: uppercase; margin: 0; }
        .sub-header { font-size: 11px; letter-spacing: 0.25em; color: #A7A7A7; margin-top: 4px; text-transform: uppercase; }
        .content { padding: 32px 24px; }
        .footer { background-color: #090909; padding: 24px; text-align: center; font-size: 11px; color: #888888; border-top: 1px solid rgba(255, 255, 255, 0.08); }
        .btn { display: inline-block; background-color: #C5A15A; color: #090909; font-weight: 700; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; padding: 12px 28px; text-decoration: none; border-radius: 2px; margin: 20px 0; }
        .gold-box { background-color: rgba(197, 161, 90, 0.08); border-left: 3px solid #C5A15A; padding: 16px; margin: 20px 0; font-size: 13px; line-height: 1.6; }
        .meta-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
        .meta-table th { text-align: left; padding: 8px 0; border-bottom: 1px solid rgba(197, 161, 90, 0.2); color: #C5A15A; font-weight: 600; text-transform: uppercase; font-size: 11px; }
        .meta-table td { padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
        a { color: #C5A15A; }
      </style>
    </head>
    <body>
      <div style="padding: 24px 12px;">
        <div class="wrapper">
          <div class="header">
            <h1 class="logo-text">PEACHTREE CORNERS</h1>
            <div class="sub-header">LOAN &amp; PAWN &bull; THE VAULT</div>
          </div>
          <div class="content">
            ${contentHtml}
          </div>
          <div class="footer">
            <p style="margin: 0 0 8px 0;"><strong>Peachtree Corners Loan &amp; Pawn</strong></p>
            <p style="margin: 0 0 8px 0;">${STORE_INFO.address.street}, ${STORE_INFO.address.city}, ${STORE_INFO.address.state} ${STORE_INFO.address.zip}</p>
            <p style="margin: 0 0 12px 0;">Phone: ${STORE_INFO.phone.formatted} &bull; Website: <a href="${STORE_INFO.existingWebsite}">pawnshopnorcross.com</a></p>
            <p style="font-size: 10px; color: #666666; margin: 0;">You are receiving this communication regarding your account, transaction, or explicit marketing consent. <a href="#/account?tab=marketing">Manage Preferences</a> &bull; <a href="#/unsubscribe">Unsubscribe</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export const emailService = {
  // Send transactional email and record in notification log
  sendEmail({ to, subject, previewText, contentHtml, category = 'transactional' }) {
    const fullHtml = wrapLuxuryEmailTemplate(contentHtml, subject);
    
    const db = dbService.getSnapshot();
    const notificationRecord = {
      id: 'notif-email-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      type: 'email',
      category,
      recipient: to,
      subject,
      previewText: previewText || subject,
      bodyHtml: fullHtml,
      status: 'delivered', // simulated live delivery in prototype
      timestamp: new Date().toISOString()
    };

    db.notificationLogs = [notificationRecord, ...(db.notificationLogs || [])];
    dbService.saveSnapshot(db);

    return {
      success: true,
      notificationId: notificationRecord.id,
      message: `Email "${subject}" successfully delivered to ${to}`
    };
  },

  // Welcome Email
  sendWelcomeEmail(customer) {
    const content = `
      <h2 style="font-size: 22px; color: #F6F2E9; margin-top: 0;">Welcome to The Vault, ${customer.firstName || 'Valued Client'}.</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #A7A7A7;">
        Thank you for establishing your account with Peachtree Corners Loan &amp; Pawn. You now have privileged access to browse verified estate jewelry, fine luxury watches, contractor tools, and musical instruments.
      </p>
      <div class="gold-box">
        <strong>Store Location &amp; In-Person Showroom:</strong><br>
        7040 Jimmy Carter Boulevard, Suite 4<br>
        Peachtree Corners, GA 30092<br>
        Phone: (678) 691-1692
      </div>
      <p style="text-align: center;">
        <a href="#/vault" class="btn">Explore The Vault</a>
      </p>
    `;
    return this.sendEmail({
      to: customer.email,
      subject: "Welcome to The Vault | Peachtree Corners Loan & Pawn",
      previewText: "Your account is active. Explore our showroom and new arrivals.",
      contentHtml: content,
      category: 'account'
    });
  },

  // Order Confirmation & Receipt
  sendOrderConfirmation(order) {
    const itemsRows = order.items.map(item => `
      <tr>
        <td>
          <strong>${item.title}</strong><br>
          <span style="font-size: 11px; color: #888;">SKU: ${item.sku || 'N/A'} &bull; Qty: ${item.quantity}</span>
        </td>
        <td style="text-align: right; color: #C5A15A; font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const fulfillmentText = order.fulfillmentMethod === 'pickup' 
      ? `<strong>In-Store Pickup Selected</strong><br>Location: 7040 Jimmy Carter Blvd, Suite 4, Peachtree Corners, GA 30092.<br>Please bring a government-issued photo ID matching your order name.`
      : `<strong>Insured Courier Shipping Selected</strong><br>Address: ${order.shippingAddress?.street}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.zip}`;

    const content = `
      <h2 style="font-size: 22px; color: #F6F2E9; margin-top: 0;">Order Confirmed: #${order.orderNumber}</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #A7A7A7;">
        Thank you for shopping with Peachtree Corners Loan &amp; Pawn. We have received your payment and our staff has reserved your selected merchandise.
      </p>
      <div class="gold-box">
        ${fulfillmentText}
      </div>
      <table class="meta-table">
        <thead>
          <tr>
            <th>Item Details</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
          <tr>
            <td style="padding-top: 14px;">Subtotal</td>
            <td style="padding-top: 14px; text-align: right;">$${order.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Sales Tax (GA 6%)</td>
            <td style="text-align: right;">$${order.tax.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Fulfillment / Shipping</td>
            <td style="text-align: right;">$${order.shippingCost ? order.shippingCost.toFixed(2) : '0.00 (Free In-Store Pickup)'}</td>
          </tr>
          <tr style="border-top: 2px solid #C5A15A;">
            <td style="font-size: 15px; font-weight: bold; color: #F6F2E9;">Total Paid</td>
            <td style="font-size: 16px; font-weight: bold; text-align: right; color: #C5A15A;">$${order.total.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <p style="font-size: 12px; color: #888888;">
        Payment Method: ${order.paymentMethod === 'card_online' ? 'Credit/Debit Card (Online)' : 'In-Store Counter'}<br>
        Transaction Reference: ${order.paymentTransactionId || 'TXN-CONFIRMED'}
      </p>
      <p style="text-align: center;">
        <a href="#/account?tab=orders" class="btn">View Order In Account</a>
      </p>
    `;

    return this.sendEmail({
      to: order.customerEmail,
      subject: `Order Confirmed: #${order.orderNumber} | Peachtree Corners Loan & Pawn`,
      previewText: `Order #${order.orderNumber} confirmed. Total: $${order.total.toFixed(2)}`,
      contentHtml: content,
      category: 'order'
    });
  },

  // Ready for Pickup Notification
  sendReadyForPickup(order) {
    const content = `
      <h2 style="font-size: 22px; color: #C5A15A; margin-top: 0;">Your Order is Ready for In-Store Pickup</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #F6F2E9;">
        Good news! Your order <strong>#${order.orderNumber}</strong> has been inspected, packaged, and is waiting for you in our secure showroom vault.
      </p>
      <div class="gold-box">
        <strong>Store Pickup Location:</strong><br>
        Peachtree Corners Loan &amp; Pawn<br>
        7040 Jimmy Carter Boulevard, Suite 4<br>
        Peachtree Corners, GA 30092<br>
        <span style="font-size: 12px; color: #C5A15A;">Hours: Monday &ndash; Saturday, 9:30 AM &ndash; 6:00 PM</span>
      </div>
      <p style="font-size: 13px; color: #A7A7A7;">
        <strong>Important Pickup Requirements:</strong><br>
        Please present a valid government-issued photo ID (Driver's License or Passport) matching <strong>${order.customerName}</strong> and your order confirmation number upon arrival.
      </p>
      <p style="text-align: center;">
        <a href="${STORE_INFO.directionsUrl}" class="btn" target="_blank">Get Driving Directions</a>
      </p>
    `;
    return this.sendEmail({
      to: order.customerEmail,
      subject: `Ready for Pickup: Order #${order.orderNumber} | Peachtree Corners Loan & Pawn`,
      previewText: `Your order is ready for counter pickup at 7040 Jimmy Carter Blvd.`,
      contentHtml: content,
      category: 'order'
    });
  },

  // Review Invitation Email (Sent after fulfillment / completion)
  sendReviewInvitation(order) {
    const content = `
      <h2 style="font-size: 22px; color: #F6F2E9; margin-top: 0;">How was your experience with Peachtree Corners Loan &amp; Pawn?</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #A7A7A7;">
        Thank you for shopping with us. We appreciate your business. When you have a moment, we'd love to hear about your experience. Your honest feedback helps us continue improving our store and serving the Peachtree Corners &amp; Norcross community with transparency and pride.
      </p>
      <div class="gold-box" style="text-align: center;">
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #F6F2E9;">
          "Your honest review makes all the difference for our local family-run store."
        </p>
        <a href="${STORE_INFO.existingWebsite}" class="btn" target="_blank">Share Your Feedback</a>
      </div>
      <p style="font-size: 12px; color: #888888; text-align: center;">
        We welcome honest feedback from every customer. No incentives or rewards were offered in exchange for this review.
      </p>
    `;

    return this.sendEmail({
      to: order.customerEmail,
      subject: "How was your experience with Peachtree Corners Loan & Pawn?",
      previewText: "Thank you for visiting us. We'd love your honest feedback.",
      contentHtml: content,
      category: 'review'
    });
  },

  // Weekly Vault Drop Marketing Campaign
  sendVaultDropCampaign(campaign, recipient) {
    const content = `
      <h2 style="font-size: 22px; color: #C5A15A; margin-top: 0;">THE VAULT &bull; WEEKLY DROP</h2>
      <p style="font-size: 14px; font-style: italic; color: #F6F2E9; margin-bottom: 20px;">
        "THE BEST FINDS DON'T STAY SECRET."
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #A7A7A7;">
        ${campaign.preheader || "Discover our handpicked selections freshly authenticated and cataloged in the showroom vault."}
      </p>
      <div class="gold-box">
        <strong>Weekly Drop Highlights:</strong><br>
        Solid 14K Gold Miami Cuban Chains, Swiss Chronographs, Inspected Contractor Power Tool Kits, and Vintage Studio Guitars.
      </div>
      <p style="text-align: center;">
        <a href="#/vault" class="btn">View Live Vault Drops</a>
      </p>
      <p style="font-size: 11px; color: #888888; text-align: center;">
        Items turn over quickly. To reserve by phone or inquire in person, call (678) 691-1692.
      </p>
    `;

    return this.sendEmail({
      to: recipient.email,
      subject: campaign.subject,
      previewText: campaign.preheader,
      contentHtml: content,
      category: 'marketing'
    });
  }
};
