import { Request, Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getCampaigns = async (req: AuthRequest, res: Response) => {
  try {
    // If advertiser, show only their campaigns. If admin, show all.
    const campaigns = await prisma.campaign.findMany({
      where: req.user?.role === 'ADVERTISER' ? { userId: req.user.id } : {},
      include: { metrics: true },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getCampaignById = async (req: AuthRequest, res: Response) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: { metrics: true, aiInsights: true }
    });

    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

    // Check ownership
    if (req.user?.role === 'ADVERTISER' && campaign.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const { name, budget, startDate, endDate, status } = req.body;
    
    const campaign = await prisma.campaign.create({
      data: {
        name,
        budget: parseFloat(budget),
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'DRAFT',
        userId: req.user!.id,
        metrics: {
          create: {} // Create empty metrics
        }
      },
      include: { metrics: true }
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATED_CAMPAIGN',
        details: `Created campaign: ${name}`
      }
    });

    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, budget, status, startDate, endDate } = req.body;

    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) return res.status(404).json({ success: false, message: 'Not found' });

    if (req.user?.role === 'ADVERTISER' && campaign.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        name,
        budget: budget ? parseFloat(budget) : undefined,
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      }
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) return res.status(404).json({ success: false, message: 'Not found' });

    if (req.user?.role === 'ADVERTISER' && campaign.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await prisma.campaign.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Campaign deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
