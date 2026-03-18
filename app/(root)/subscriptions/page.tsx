import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PLAN_LIMITS, PLANS } from "@/lib/subscription-constants";

export default async function SubscriptionsPage() {
   const { userId } = await auth();
   if (!userId) redirect("/sign-in");

   const plans = [
      {
         name: "Free",
         price: "$0",
         slug: PLANS.FREE,
         limits: PLAN_LIMITS[PLANS.FREE],
         current: true,
      },
      {
         name: "Standard",
         price: "$9",
         slug: PLANS.STANDARD,
         limits: PLAN_LIMITS[PLANS.STANDARD],
         current: false,
      },
      {
         name: "Pro",
         price: "$29",
         slug: PLANS.PRO,
         limits: PLAN_LIMITS[PLANS.PRO],
         current: false,
      },
   ];

   return (
      <main className="wrapper page-container">
         <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
               <h1 className="text-4xl font-bold font-serif text-[#212a3b] mb-4">
                  Choose Your Plan
               </h1>
               <p className="text-gray-500 max-w-2xl mx-auto">
                  Upgrade to unlock more books, longer sessions, and advanced features.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {plans.map((plan) => (
                  <div
                     key={plan.slug}
                     className={`rounded-xl border p-6 bg-white flex flex-col gap-4 ${
                        plan.slug === PLANS.STANDARD
                           ? "border-[#212a3b] shadow-md"
                           : "border-gray-200"
                     }`}
                  >
                     {plan.slug === PLANS.STANDARD && (
                        <span className="text-xs font-semibold uppercase tracking-wide text-white bg-[#212a3b] rounded-full px-3 py-1 self-start">
                           Popular
                        </span>
                     )}

                     <div>
                        <h2 className="font-bold text-xl text-[#212a3b]">{plan.name}</h2>
                        <p className="text-3xl font-bold mt-1">
                           {plan.price}
                           <span className="text-sm font-normal text-gray-500">/mo</span>
                        </p>
                     </div>

                     <ul className="text-sm text-gray-600 space-y-2 flex-1">
                        <li>✓ {plan.limits.maxBooks} books</li>
                        <li>✓ {plan.limits.maxSessionsPerMonth === Infinity ? 'Unlimited' : plan.limits.maxSessionsPerMonth} sessions/month</li>
                        <li>✓ {plan.limits.maxDurationPerSession} min per session</li>
                        <li>✓ {plan.limits.hasSessionHistory ? 'Session history included' : 'No session history'}</li>
                     </ul>

                     <button
                        disabled={plan.slug === PLANS.FREE}
                        className={`w-full rounded-lg py-2 text-sm font-medium transition-colors ${
                           plan.slug === PLANS.FREE
                              ? "border border-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-[#212a3b] text-white hover:bg-[#3d485e]"
                        }`}
                     >
                        {plan.slug === PLANS.FREE ? "Current Plan" : "Upgrade"}
                     </button>
                  </div>
               ))}
            </div>
         </div>
      </main>
   );
}