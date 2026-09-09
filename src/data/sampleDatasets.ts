import { Dataset } from '../types';
import { detectColumns } from '../utils/dataParser';

const salesData = [
  { Date: '2024-01', Month: 'Jan', Region: 'North America', Category: 'Electronics', Sales: 42500, Profit: 12800, Units: 420, Rating: 4.6 },
  { Date: '2024-01', Month: 'Jan', Region: 'Europe', Category: 'Furniture', Sales: 28400, Profit: 6200, Units: 210, Rating: 4.2 },
  { Date: '2024-01', Month: 'Jan', Region: 'Asia Pacific', Category: 'Apparel', Sales: 31200, Profit: 8900, Units: 650, Rating: 4.4 },
  { Date: '2024-02', Month: 'Feb', Region: 'North America', Category: 'Electronics', Sales: 48900, Profit: 15400, Units: 490, Rating: 4.8 },
  { Date: '2024-02', Month: 'Feb', Region: 'Europe', Category: 'Furniture', Sales: 29800, Profit: 7100, Units: 230, Rating: 4.1 },
  { Date: '2024-02', Month: 'Feb', Region: 'Asia Pacific', Category: 'Apparel', Sales: 35600, Profit: 10400, Units: 720, Rating: 4.5 },
  { Date: '2024-03', Month: 'Mar', Region: 'North America', Category: 'Electronics', Sales: 53200, Profit: 17100, Units: 530, Rating: 4.7 },
  { Date: '2024-03', Month: 'Mar', Region: 'Europe', Category: 'Furniture', Sales: 33100, Profit: 8400, Units: 260, Rating: 4.3 },
  { Date: '2024-03', Month: 'Mar', Region: 'Asia Pacific', Category: 'Apparel', Sales: 39400, Profit: 11800, Units: 790, Rating: 4.6 },
  { Date: '2024-04', Month: 'Apr', Region: 'North America', Category: 'Electronics', Sales: 58400, Profit: 19200, Units: 580, Rating: 4.9 },
  { Date: '2024-04', Month: 'Apr', Region: 'Europe', Category: 'Furniture', Sales: 36200, Profit: 9300, Units: 280, Rating: 4.4 },
  { Date: '2024-04', Month: 'Apr', Region: 'Asia Pacific', Category: 'Apparel', Sales: 42800, Profit: 13100, Units: 860, Rating: 4.5 },
  { Date: '2024-05', Month: 'May', Region: 'North America', Category: 'Electronics', Sales: 64100, Profit: 21500, Units: 640, Rating: 4.8 },
  { Date: '2024-05', Month: 'May', Region: 'Europe', Category: 'Furniture', Sales: 38900, Profit: 10200, Units: 300, Rating: 4.3 },
  { Date: '2024-05', Month: 'May', Region: 'Asia Pacific', Category: 'Apparel', Sales: 46500, Profit: 14600, Units: 910, Rating: 4.7 },
  { Date: '2024-06', Month: 'Jun', Region: 'North America', Category: 'Electronics', Sales: 71200, Profit: 24300, Units: 710, Rating: 4.9 },
  { Date: '2024-06', Month: 'Jun', Region: 'Europe', Category: 'Furniture', Sales: 41500, Profit: 11100, Units: 320, Rating: 4.2 },
  { Date: '2024-06', Month: 'Jun', Region: 'Asia Pacific', Category: 'Apparel', Sales: 51200, Profit: 16200, Units: 980, Rating: 4.8 },
];

const saasData = [
  { Month: 'Jan', Tier: 'Starter', NewSignups: 420, ActiveUsers: 3400, MRR: 16800, ChurnRate: 3.2, NPS: 52 },
  { Month: 'Jan', Tier: 'Pro', NewSignups: 210, ActiveUsers: 1850, MRR: 37000, ChurnRate: 1.8, NPS: 68 },
  { Month: 'Jan', Tier: 'Enterprise', NewSignups: 45, ActiveUsers: 480, MRR: 45000, ChurnRate: 0.8, NPS: 74 },
  { Month: 'Feb', Tier: 'Starter', NewSignups: 480, ActiveUsers: 3750, MRR: 18400, ChurnRate: 3.0, NPS: 54 },
  { Month: 'Feb', Tier: 'Pro', NewSignups: 245, ActiveUsers: 2040, MRR: 40800, ChurnRate: 1.6, NPS: 70 },
  { Month: 'Feb', Tier: 'Enterprise', NewSignups: 52, ActiveUsers: 525, MRR: 52000, ChurnRate: 0.6, NPS: 76 },
  { Month: 'Mar', Tier: 'Starter', NewSignups: 530, ActiveUsers: 4100, MRR: 20200, ChurnRate: 2.8, NPS: 56 },
  { Month: 'Mar', Tier: 'Pro', NewSignups: 280, ActiveUsers: 2280, MRR: 45600, ChurnRate: 1.5, NPS: 72 },
  { Month: 'Mar', Tier: 'Enterprise', NewSignups: 60, ActiveUsers: 580, MRR: 60000, ChurnRate: 0.5, NPS: 79 },
  { Month: 'Apr', Tier: 'Starter', NewSignups: 590, ActiveUsers: 4550, MRR: 22400, ChurnRate: 2.7, NPS: 55 },
  { Month: 'Apr', Tier: 'Pro', NewSignups: 315, ActiveUsers: 2540, MRR: 50800, ChurnRate: 1.4, NPS: 73 },
  { Month: 'Apr', Tier: 'Enterprise', NewSignups: 68, ActiveUsers: 640, MRR: 68000, ChurnRate: 0.4, NPS: 81 },
  { Month: 'May', Tier: 'Starter', NewSignups: 660, ActiveUsers: 5050, MRR: 24800, ChurnRate: 2.5, NPS: 58 },
  { Month: 'May', Tier: 'Pro', NewSignups: 360, ActiveUsers: 2820, MRR: 56400, ChurnRate: 1.3, NPS: 75 },
  { Month: 'May', Tier: 'Enterprise', NewSignups: 75, ActiveUsers: 710, MRR: 75000, ChurnRate: 0.4, NPS: 83 },
  { Month: 'Jun', Tier: 'Starter', NewSignups: 740, ActiveUsers: 5620, MRR: 27600, ChurnRate: 2.3, NPS: 60 },
  { Month: 'Jun', Tier: 'Pro', NewSignups: 410, ActiveUsers: 3150, MRR: 63000, ChurnRate: 1.2, NPS: 77 },
  { Month: 'Jun', Tier: 'Enterprise', NewSignups: 86, ActiveUsers: 790, MRR: 86000, ChurnRate: 0.3, NPS: 85 },
];

const marketingData = [
  { Channel: 'Google Ads', Campaign: 'Search Intent Q1', AdSpend: 18500, Impressions: 420000, Clicks: 21500, Conversions: 1240, Revenue: 62000, ROI: 235 },
  { Channel: 'Social Ads', Campaign: 'Meta Retargeting', AdSpend: 14200, Impressions: 680000, Clicks: 28400, Conversions: 980, Revenue: 44100, ROI: 210 },
  { Channel: 'Email Marketing', Campaign: 'Product Lifecycle', AdSpend: 3200, Impressions: 125000, Clicks: 18200, Conversions: 1150, Revenue: 38500, ROI: 1103 },
  { Channel: 'SEO & Organic', Campaign: 'Blog Inbound Hub', AdSpend: 6500, Impressions: 890000, Clicks: 44500, Conversions: 1680, Revenue: 78200, ROI: 1103 },
  { Channel: 'Influencers', Campaign: 'Spring Creator Tour', AdSpend: 12000, Impressions: 540000, Clicks: 15600, Conversions: 620, Revenue: 27900, ROI: 132 },
  { Channel: 'Affiliates', Campaign: 'Partner Referral Network', AdSpend: 7800, Impressions: 210000, Clicks: 11200, Conversions: 740, Revenue: 34500, ROI: 342 },
  { Channel: 'Display & Banner', Campaign: 'Brand Awareness Push', AdSpend: 9500, Impressions: 920000, Clicks: 9200, Conversions: 210, Revenue: 11400, ROI: 20 },
];

export const sampleDatasets: Dataset[] = [
  {
    id: 'sales-perf',
    title: 'Global Sales & Regional Profit',
    description: 'Monthly revenue, net profit, unit volumes, and customer ratings across world regions.',
    data: salesData,
    columns: detectColumns(salesData),
  },
  {
    id: 'saas-metrics',
    title: 'SaaS Growth & Tier Metrics',
    description: 'Active users, Monthly Recurring Revenue (MRR), new signups, churn rate, and NPS by plan.',
    data: saasData,
    columns: detectColumns(saasData),
  },
  {
    id: 'marketing-perf',
    title: 'Marketing Channels & Acquisition ROI',
    description: 'Ad spend, impression reach, click conversions, attributable revenue, and return on investment.',
    data: marketingData,
    columns: detectColumns(marketingData),
  },
];
