import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { USER_PLAN } from "@/utils/const";
import { AnimatePresence, motion } from "framer-motion";
import { AlipayCircleOutlined, WechatOutlined } from "@ant-design/icons";

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
  onSelect: () => void;
  onCancel: () => void;
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
  onSelect,
  onCancel,
}) => {
  const { t } = useTranslation();

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
        <span
          className="absolute -top-3 right-4 text-white px-3 py-1 rounded-full text-sm
                      bg-gradient-to-r from-green-500 to-green-600 hover:bg-gradient-to-r
                  dark:bg-gradient-to-r dark:from-orange-600 dark:to-gray-800"
        >
          {t("current")}
        </span>
      )}

      <h3 className="text-xl font-semibold mb-4 dark:text-white">{title}</h3>

      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold dark:text-white">¥</span>
          <span className="text-5xl font-bold dark:text-white">{price}</span>
          <span className="text-gray-500 dark:text-gray-400 ml-2">
            / {duration}
          </span>
        </div>
        <span className="text-gray-500 dark:text-gray-400 line-through">
          {originalPrice ? `¥${originalPrice}` : ""}
        </span>
      </div>

      <div className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center">
            {feature.included ? (
              <CheckIcon className="h-5 w-5 text-green-500 dark:text-orange-500 mr-2" />
            ) : (
              <XMarkIcon className="h-5 w-5 text-gray-400 mr-2" />
            )}
            <span
              className={`
              ${
                feature.included
                  ? "dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }
            `}
            >
              {feature.feature}
            </span>
          </div>
        ))}
      </div>

      {id !== USER_PLAN.FREE && !isCurrent && !toBeCanceled && (
        <button
          onClick={onSelect}
          className={`
          w-full py-3 px-4 rounded-lg font-semibold transition-colors duration-200
          ${
            isPopular
              ? `text-white bg-gradient-to-r from-green-500 to-green-600
                  hover:bg-gradient-to-r hover:from-green-600 hover:to-green-700
                  dark:bg-gradient-to-r dark:from-orange-600 dark:to-gray-800
                  dark:hover:bg-gradient-to-r dark:hover:from-orange-700 dark:hover:to-gray-800`
              : `text-white bg-gray-300 hover:bg-gradient-to-r hover:from-green-600 hover:to-green-700
                  dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gradient-to-r dark:hover:from-orange-700 dark:hover:to-gray-800`
          }
        `}
        >
          {t("selectPlan")}
        </button>
      )}
      {toBeCanceled && (
        <button
          onClick={onCancel}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors duration-200
            text-white bg-gray-300 hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-700
                  dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gradient-to-r dark:hover:from-gray-700 dark:hover:to-gray-800`}
        >
          {t("cancel")}
        </button>
      )}
    </div>
  );
};

const PaymentOptions: React.FC<{ onSelect: (method: string) => void }> = ({
  onSelect,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <h3 className="text-xl font-semibold mb-6 dark:text-white">
        {t("selectPaymentMethod")}
      </h3>
      <button
        onClick={() => onSelect("alipay")}
        className="w-full flex items-center justify-center space-x-2 p-4 rounded-lg transition-all duration-300 cursor-pointer
                 bg-blue-50 hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-gray-600
                 border-2 border-blue-500 dark:border-blue-400 hover:shadow-xl hover:scale-105"
      >
        <AlipayCircleOutlined className="text-2xl text-blue-500 dark:text-blue-400" />
        <span className="text-lg font-medium dark:text-white">
          {t("alipay")}
        </span>
      </button>
      <button
        onClick={() => onSelect("wechat")}
        className="w-full flex items-center justify-center space-x-2 p-4 rounded-lg transition-all duration-300
                 bg-green-50 hover:bg-green-100 dark:bg-gray-700 dark:hover:bg-gray-600
                 border-2 border-green-500 dark:border-green-400 hover:shadow-xl hover:scale-105"
      >
        <WechatOutlined className="text-2xl text-green-500 dark:text-green-400" />
        <span className="text-lg font-medium dark:text-white">
          {t("wechat")}
        </span>
      </button>
    </motion.div>
  );
};

export const UpgradePlan: React.FC = () => {
  const { t } = useTranslation();
  const { userInfo } = useSelector((state: RootState) => state.user);
  const currentPlan = userInfo?.plan;
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSelectPayment = (method: string) => {
    console.log(`Selected payment method: ${method} for plan: ${selectedPlan}`);
  };

  const plans = [
    {
      id: USER_PLAN.FREE,
      title: t("freePlan"),
      price: 0,
      duration: t("limited"),
      features: [
        { feature: t("basicLearningMaterials"), included: true },
        { feature: t("limitedDictations"), included: true },
        { feature: t("basicListeningMode"), included: true },
        { feature: t("communitySupport"), included: true },
        { feature: t("advancedFeatures"), included: false },
        { feature: t("prioritySupport"), included: false },
      ],
      isCurrent: currentPlan?.name === USER_PLAN.FREE,
    },
    {
      id: USER_PLAN.PRO,
      title: t("proPlan"),
      price: 49,
      originalPrice: 57,
      duration: t("3monthsUnlimited"),
      features: [
        { feature: t("unlimitedLearningMaterials"), included: true },
        { feature: t("unlimitedDictations"), included: true },
        { feature: t("advancedListeningMode"), included: true },
        { feature: t("prioritySupport"), included: true },
        { feature: t("earlyAccess"), included: true },
        { feature: t("customLearningPath"), included: true },
      ],
      isPopular: true,
      isCurrent: currentPlan?.name === USER_PLAN.PRO,
    },
    {
      id: USER_PLAN.PREMIUM,
      title: t("premiumPlan"),
      price: 89,
      originalPrice: 114,
      duration: t("6monthsUnlimited"),
      features: [
        { feature: t("everythingInPro"), included: true },
        { feature: t("personalizedCoaching"), included: true },
        { feature: t("exclusiveContent"), included: true },
        { feature: t("offlineAccess"), included: true },
        { feature: t("progressAnalytics"), included: true },
        { feature: t("dedicatedSupport"), included: true },
      ],
      isCurrent: currentPlan?.name === USER_PLAN.PREMIUM,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4 dark:text-white">
          {t("choosePlanTitle")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t("choosePlanDescription")}
        </p>
      </div>

      <AnimatePresence>
        {!selectedPlan ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <PlanCard
                  key={index}
                  {...plan}
                  toBeCanceled={false}
                  onSelect={() => handleSelectPlan(plan.id)}
                  onCancel={() => {}}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="flex justify-center w-full">
            <motion.div
              className="flex justify-center items-start gap-20 w-full max-w-[1000px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-[400px]"
              >
                <PlanCard
                  {...plans.find((p) => p.id === selectedPlan)!}
                  toBeCanceled={true}
                  onSelect={() => {}}
                  onCancel={() => setSelectedPlan(null)}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-[400px]"
              >
                <PaymentOptions onSelect={handleSelectPayment} />
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
