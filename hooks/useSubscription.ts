'use client';

import { useUser } from "@clerk/nextjs";
import { PLANS, PLAN_LIMITS, PlanType } from "@/lib/subscription-constants";

export const useSubscription = () => {
   const { user, isLoaded } = useUser();

   let plan: PlanType = PLANS.FREE;

   if (isLoaded && user) {
      const metadataPlan = user.publicMetadata?.plan?.toString().toLowerCase();

      if (metadataPlan === 'pro') {
         plan = PLANS.PRO;
      } else if (metadataPlan === 'standard') {
         plan = PLANS.STANDARD;
      }
   }

   return {
      plan,
      limits: PLAN_LIMITS[plan],
      isLoaded,
   };
};