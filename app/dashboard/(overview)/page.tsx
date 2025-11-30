import CardWrapper from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
// 数据库获取利润数据
import { Suspense } from 'react';
import { CardsSkeleton, LatestInvoicesSkeleton, RevenueChartSkeleton } from '@/app/ui/skeletons';

// 该页面async是一个异步服务器组件。这允许您使用 await 来获取数据。
export default async function Page() {
  // 获取利润数据
  //const revenue = await fetchRevenue();
  //console.log(revenue);
  // 获取最新发票数据
  // const latestInvoices = await fetchLatestInvoices();
  // console.log(latestInvoices);
  // 获取卡片数据
  // const { totalPaidInvoices, totalPendingInvoices, numberOfInvoices, numberOfCustomers } = await fetchCardData();
  // console.log(totalPaidInvoices, totalPendingInvoices, numberOfInvoices, numberOfCustomers);
  
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
       
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton />}>
           <RevenueChart />  
        </Suspense>
        
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices/>
        </Suspense>
        
      </div>
    </main>
  );
}