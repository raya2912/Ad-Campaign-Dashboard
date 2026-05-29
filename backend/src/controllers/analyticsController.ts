import { Request, Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getDashboardAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: req.user?.role === 'ADVERTISER' ? { userId: req.user.id } : {},
      include: { metrics: true }
    });

    let totalImpressions = 0;
    let totalClicks = 0;
    let totalSpend = 0;
    let totalConversions = 0;
    let totalRevenue = 0;

    campaigns.forEach(c => {
      if (c.metrics) {
        totalImpressions += c.metrics.impressions;
        totalClicks += c.metrics.clicks;
        totalSpend += c.metrics.spend;
        totalConversions += c.metrics.conversions;
        totalRevenue += c.metrics.revenue;
      }
    });

    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

    res.status(200).json({
      success: true,
      data: {
        totalCampaigns: campaigns.length,
        totalImpressions,
        totalClicks,
        totalSpend,
        totalConversions,
        totalRevenue,
        ctr: ctr.toFixed(2),
        cpc: cpc.toFixed(2),
        conversionRate: conversionRate.toFixed(2),
        roas: roas.toFixed(2),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
