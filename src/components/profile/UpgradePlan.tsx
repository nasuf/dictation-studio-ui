import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckIcon,
  CreditCardIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import {
  DEFAULT_DICTATION_CONFIG,
  DEFAULT_LANGUAGE,
  USER_KEY,
  USER_PLAN,
  USER_PLAN_DURATION,
  USER_ROLE,
} from "@/utils/const";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "@/api/api";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { setUser } from "@/redux/userSlice";

interface PlanFeature {
  feature: string;
  included: boolean;
  isCurrent?: boolean;
}

interface PlanProps {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  duration: string;
  features: PlanFeature[];
  isPopular?: boolean;
  isCurrent?: boolean;
  toBeCanceled?: boolean;
  currentPlan?: { name: string };
  onSelect: () => void;
  onCancel: () => void;
  onCancelPlan: () => void;
}

const PlanCard: React.FC<PlanProps> = ({
  id,
  title,
  price,
  originalPrice,
  duration,
  features,
  isPopular,
  isCurrent,
  toBeCanceled,
  currentPlan,
  onCancelPlan,
  onSelect,
  onCancel,
}) => {
  const { t } = useTranslation();
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <div
      className={`
        relative rounded-lg p-6
        dark:bg-gray-800 bg-white
        transition-all duration-300
        hover:border-2 hover:border-green-500
        dark:hover:border-orange-500
        hover:shadow-xl hover:scale-105
      `}
    >
      {isPopular && (
        <span
          className="absolute -top-3 right-4 text-white px-3 py-1 rounded-full text-sm
                      bg-gradient-to-r from-green-500 to-green-600 hover:bg-gradient-to-r
                  dark:bg-gradient-to-r dark:from-orange-600 dark:to-gray-800"
        >
          {t("popular")}
        </span>
      )}
      {isCurrent && (
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
          <span
            className="inline-block px-4 py-1 text-sm font-semibold text-white rounded-full
            bg-gradient-to-r from-blue-500 to-blue-600
            dark:from-purple-500 dark:to-purple-600"
          >
            {t("current")}
          </span>
        </div>
      )}

      <h3 className="text-2xl font-bold text-center mb-4 dark:text-white">
        {title}
      </h3>

      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center">
          <span className="text-2xl font-semibold dark:text-white">¥</span>
          <span className="text-5xl font-bold mx-1 dark:text-white">
            {price}
          </span>
          <span className="text-gray-500 dark:text-gray-400">/ {duration}</span>
        </div>
        {originalPrice && (
          <div className="mt-1">
            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
              ¥{originalPrice}
            </span>
          </div>
        )}
      </div>

      <div className="flex-grow space-y-4 mb-8">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start space-x-3">
            {feature.included ? (
              <CheckIcon className="h-5 w-5 text-green-500 dark:text-orange-500 flex-shrink-0 mt-0.5" />
            ) : (
              <XMarkIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
            )}
            <span
              className={`
              text-sm
              ${
                feature.included
                  ? "text-gray-900 dark:text-gray-100"
                  : "text-gray-500 dark:text-gray-400"
              }
            `}
            >
              {feature.feature}
            </span>
          </div>
        ))}
      </div>

      {id !== USER_PLAN.FREE && !toBeCanceled && !isCurrent && (
        <button
          onClick={onSelect}
          disabled={
            currentPlan?.name === USER_PLAN.PREMIUM && id === USER_PLAN.PRO
          }
          className={`
            w-full py-4 px-6 rounded-xl font-semibold text-center
            transition-all duration-300
            ${
              currentPlan?.name === USER_PLAN.PREMIUM && id === USER_PLAN.PRO
                ? "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                : isPopular
                ? "text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg dark:from-orange-500 dark:to-orange-600 dark:hover:from-orange-600 dark:hover:to-orange-700"
                : "text-white bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
            }
          `}
        >
          {t("selectPlan")}
        </button>
      )}
      {isCurrent && (
        <button
          onClick={onCancelPlan}
          className="w-full py-4 px-6 rounded-xl font-semibold text-center
            text-white bg-red-500 hover:bg-red-600
            dark:bg-red-600 dark:hover:bg-red-700
            transition-all duration-300"
        >
          {t("cancelPlan")}
        </button>
      )}
      {toBeCanceled && (
        <button
          onClick={onCancel}
          className="w-full py-4 px-6 rounded-xl font-semibold text-center
            text-gray-700 bg-gray-200 hover:bg-gray-300
            dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600
            transition-all duration-300"
        >
          {t("cancel")}
        </button>
      )}
    </div>
  );
};

interface SubscriptionOption {
  type: "recurring" | "onetime";
  price: number;
  description: string;
}

const PaymentOptions: React.FC<{
  onSelect: (method: string, subscriptionType: "recurring" | "onetime") => void;
  planPrice: number;
}> = ({ onSelect, planPrice }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<"recurring" | "onetime">(
    "recurring"
  );

  const subscriptionOptions: SubscriptionOption[] = [
    {
      type: "recurring",
      price: planPrice,
      description: t("autoRenewDescription"), // "Auto-renew subscription, cancel anytime"
    },
    {
      type: "onetime",
      price: planPrice * 1.2,
      description: t("onetimeDescription"), // "One-time purchase, no auto-renewal"
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold mb-6 dark:text-white">
        {t("selectSubscriptionMethod")}
      </h3>

      <div className="space-y-3">
        {subscriptionOptions.map((option) => (
          <div
            key={option.type}
            onClick={() => setSelectedType(option.type)}
            className={`
              p-4 rounded-xl border-2 cursor-pointer
              transition-all duration-200
              ${
                selectedType === option.type
                  ? "border-green-500 dark:border-orange-500 bg-green-50 dark:bg-gray-700"
                  : "border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-orange-400"
              }
            `}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-3">
                <div
                  className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${
                      selectedType === option.type
                        ? "border-green-500 dark:border-orange-500"
                        : "border-gray-300 dark:border-gray-500"
                    }
                  `}
                >
                  {selectedType === option.type && (
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 dark:bg-orange-500" />
                  )}
                </div>
                <span className="font-medium dark:text-white">
                  {option.type === "recurring"
                    ? t("autoRenew")
                    : t("onetimePurchase")}
                </span>
              </div>
              <span className="font-bold dark:text-white">¥{option.price}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-8">
              {option.description}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={async () => {
          setIsLoading(true);
          try {
            await onSelect("stripe", selectedType);
          } finally {
            setIsLoading(false);
          }
        }}
        disabled={isLoading}
        className={`
          w-full py-4 px-6 rounded-xl font-semibold
          flex items-center justify-center space-x-3
          transition-all duration-300
          ${
            isLoading
              ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 dark:from-orange-500 dark:to-orange-600 dark:hover:from-orange-600 dark:hover:to-orange-700"
          }
          text-white shadow-md hover:shadow-lg
        `}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>{t("processing")}</span>
          </div>
        ) : (
          <>
            <CreditCardIcon className="h-5 w-5" />
            <span>{t("clickToPay")}</span>
          </>
        )}
      </button>
    </motion.div>
  );
};

export const UpgradePlan: React.FC = () => {
  const { t } = useTranslation();
  const { userInfo } = useSelector((state: RootState) => state.user);
  const currentPlan = userInfo?.plan;
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const plans = [
    {
      id: USER_PLAN.FREE,
      title: t("freePlan"),
      price: 0,
      duration: t("unlimitedTime"),
      features: [
        { feature: t("basicFeatures"), included: true },
        { feature: t("limitedDictations"), included: true },
        { feature: t("standardSupport"), included: true },
        { feature: t("advancedFeatures"), included: false },
        { feature: t("prioritySupport"), included: false },
        { feature: t("customFeatures"), included: false },
      ],
    },
    {
      id: USER_PLAN.BASIC,
      title: t("basicPlan"),
      price: 29,
      originalPrice: 39,
      duration: t("oneMonth"),
      features: [
        { feature: t("allFreeFeatures"), included: true },
        { feature: t("unlimitedDictations"), included: true },
        { feature: t("standardSupport"), included: true },
        { feature: t("advancedFeatures"), included: false },
        { feature: t("prioritySupport"), included: false },
        { feature: t("customFeatures"), included: false },
      ],
    },
    {
      id: USER_PLAN.PRO,
      title: t("proPlan"),
      price: 49,
      originalPrice: 69,
      duration: t("threeMonths"),
      isPopular: true,
      features: [
        { feature: t("allBasicFeatures"), included: true },
        { feature: t("unlimitedDictations"), included: true },
        { feature: t("advancedFeatures"), included: true },
        { feature: t("prioritySupport"), included: true },
        { feature: t("customFeatures"), included: false },
        { feature: t("dedicatedSupport"), included: false },
      ],
    },
    {
      id: USER_PLAN.PREMIUM,
      title: t("premiumPlan"),
      price: 99,
      originalPrice: 129,
      duration: t("sixMonths"),
      features: [
        { feature: t("allProFeatures"), included: true },
        { feature: t("unlimitedEverything"), included: true },
        { feature: t("customFeatures"), included: true },
        { feature: t("dedicatedSupport"), included: true },
        { feature: t("priorityDevelopment"), included: true },
        { feature: t("exclusiveContent"), included: true },
      ],
    },
  ];

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await api.verifyPaymentSession(sessionId);
      if (response.data.status === "paid") {
        message.success("Payment successful!");
        const user = response.data.userInfo;
        if (!user.language) {
          user.language = DEFAULT_LANGUAGE;
        }
        if (
          !user.dictation_config ||
          Object.keys(user.dictation_config).length === 0
        ) {
          user.dictation_config = DEFAULT_DICTATION_CONFIG;
        }
        if (!user.plan) {
          user.plan = USER_PLAN.FREE;
        }
        if (!user.role) {
          user.role = USER_ROLE.USER;
        }
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        dispatch(setUser(user));
      } else {
        message.error("Payment verification failed");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      message.error("Failed to verify payment");
    } finally {
      // Clear the session_id parameter from the URL
      navigate(location.pathname, { replace: true });
    }
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSelectPayment = async (
    method: string,
    subscriptionType: "recurring" | "onetime"
  ) => {
    if (method === "stripe") {
      try {
        const duration =
          selectedPlan === USER_PLAN.PRO
            ? USER_PLAN_DURATION.PRO
            : USER_PLAN_DURATION.PREMIUM;

        const response = await api.createStripeSession(
          selectedPlan!,
          duration,
          subscriptionType === "recurring"
        );

        window.location.href = response.data.url;
      } catch (error) {
        console.error("Error creating Stripe session:", error);
        message.error(t("paymentInitFailed"));
      }
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get("payment_session_id");

    if (sessionId) {
      verifyPayment(sessionId);
    }
  }, [location.search]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4 dark:text-white">
          {t("choosePlanTitle")}
        </h2>
      </div>

      <AnimatePresence mode="wait">
        {!selectedPlan ? (
          <motion.div
            key="plans"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                {...plan}
                isCurrent={currentPlan?.name === plan.id}
                currentPlan={currentPlan}
                onSelect={() => handleSelectPlan(plan.id)}
                onCancel={() => setSelectedPlan(null)}
                onCancelPlan={() => {}}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col lg:flex-row justify-center items-start gap-8 max-w-5xl mx-auto"
          >
            <div className="w-full lg:w-2/5">
              <div className="sticky top-8">
                <PlanCard
                  {...plans.find((p) => p.id === selectedPlan)!}
                  toBeCanceled={true}
                  onSelect={() => {}}
                  onCancel={() => setSelectedPlan(null)}
                  onCancelPlan={() => {}}
                />
              </div>
            </div>

            <div className="w-full lg:w-3/5 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div className="max-w-lg mx-auto">
                <PaymentOptions
                  onSelect={handleSelectPayment}
                  planPrice={
                    plans.find((p) => p.id === selectedPlan)?.price || 0
                  }
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
