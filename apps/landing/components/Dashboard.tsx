'use client';

import {
  Card,
  Title,
  Text,
  Tab,
  TabList,
  TabGroup,
  TabPanel,
  TabPanels,
  Metric,
  Badge,
  Flex,
  Grid,
  AreaChart,
  DonutChart,
  BarList,
} from '@tremor/react';
import { useState } from 'react';

const chartdata = [
  {
    date: 'Jan 22',
    'Total Views': 2890,
    'Unique Visitors': 2400,
    'Page Views': 2400,
  },
  {
    date: 'Jan 23',
    'Total Views': 2756,
    'Unique Visitors': 2400,
    'Page Views': 2210,
  },
  {
    date: 'Jan 24',
    'Total Views': 3322,
    'Unique Visitors': 2400,
    'Page Views': 2900,
  },
  {
    date: 'Jan 25',
    'Total Views': 3470,
    'Unique Visitors': 2400,
    'Page Views': 3100,
  },
  {
    date: 'Jan 26',
    'Total Views': 3475,
    'Unique Visitors': 2400,
    'Page Views': 3200,
  },
  {
    date: 'Jan 27',
    'Total Views': 3129,
    'Unique Visitors': 2400,
    'Page Views': 2800,
  },
];

const userData = [
  {
    name: 'Organic Search',
    value: 456,
    icon: '🔍',
  },
  {
    name: 'Direct Traffic',
    value: 351,
    icon: '🎯',
  },
  {
    name: 'Social Media',
    value: 271,
    icon: '📱',
  },
  {
    name: 'Referral',
    value: 191,
    icon: '🔗',
  },
  {
    name: 'Email',
    value: 164,
    icon: '📧',
  },
];

const countries = [
  {
    country: 'United States',
    value: 456,
    percentage: 32,
  },
  {
    country: 'Germany',
    value: 351,
    percentage: 25,
  },
  {
    country: 'United Kingdom',
    value: 271,
    percentage: 19,
  },
  {
    country: 'Canada',
    value: 191,
    percentage: 13,
  },
  {
    country: 'France',
    value: 164,
    percentage: 11,
  },
];

export function Dashboard() {
  const [selectedView, setSelectedView] = useState(0);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Title className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </Title>
          <Text className="text-gray-600 dark:text-gray-400">
            Monitor your website performance and user engagement
          </Text>
        </div>

        <TabGroup index={selectedView} onIndexChange={setSelectedView}>
          <TabList variant="solid">
            <Tab>Overview</Tab>
            <Tab>Traffic</Tab>
            <Tab>Users</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <div className="mt-6">
                <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
                  <Card>
                    <Text>Total Views</Text>
                    <Metric>34,743</Metric>
                    <Badge color="green" className="mt-2">
                      +12.3%
                    </Badge>
                  </Card>
                  <Card>
                    <Text>Unique Visitors</Text>
                    <Metric>24,000</Metric>
                    <Badge color="green" className="mt-2">
                      +8.1%
                    </Badge>
                  </Card>
                  <Card>
                    <Text>Page Views</Text>
                    <Metric>31,200</Metric>
                    <Badge color="green" className="mt-2">
                      +15.7%
                    </Badge>
                  </Card>
                  <Card>
                    <Text>Bounce Rate</Text>
                    <Metric>23.4%</Metric>
                    <Badge color="red" className="mt-2">
                      -2.1%
                    </Badge>
                  </Card>
                </Grid>

                <div className="mt-6">
                  <Card>
                    <Title>Website Traffic</Title>
                    <AreaChart
                      className="mt-4 h-72"
                      data={chartdata}
                      index="date"
                      categories={['Total Views', 'Unique Visitors', 'Page Views']}
                      colors={['indigo', 'cyan', 'rose']}
                    />
                  </Card>
                </div>
              </div>
            </TabPanel>

            <TabPanel>
              <div className="mt-6">
                <Grid numItems={1} numItemsLg={2} className="gap-6">
                  <Card>
                    <Title>Traffic Sources</Title>
                    <DonutChart
                      className="mt-4 h-52"
                      data={userData}
                      category="value"
                      index="name"
                      colors={['indigo', 'cyan', 'rose', 'amber', 'emerald']}
                    />
                  </Card>
                  <Card>
                    <Title>Top Countries</Title>
                    <BarList
                      className="mt-4"
                      data={countries}
                      value="value"
                      index="country"
                      color="indigo"
                    />
                  </Card>
                </Grid>
              </div>
            </TabPanel>

            <TabPanel>
              <div className="mt-6">
                <Card>
                  <Title>User Engagement</Title>
                  <Text className="mt-2">
                    Detailed metrics about user behavior and engagement patterns
                  </Text>
                  <div className="mt-4">
                    <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Text className="text-blue-600 dark:text-blue-400">Avg. Session Duration</Text>
                        <Metric className="text-blue-900 dark:text-blue-100">4m 32s</Metric>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <Text className="text-green-600 dark:text-green-400">Pages per Session</Text>
                        <Metric className="text-green-900 dark:text-green-100">3.2</Metric>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <Text className="text-purple-600 dark:text-purple-400">Return Rate</Text>
                        <Metric className="text-purple-900 dark:text-purple-100">28.4%</Metric>
                      </div>
                    </Grid>
                  </div>
                </Card>
              </div>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
}
