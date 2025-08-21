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
  ZPAY_PLANS,
  USER_KEY,
  USER_PLAN,
  USER_PLAN_DURATION,
} from "@/utils/const";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "@/api/api";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { setUser } from "@/redux/userSlice";
import { PlanProps, PaymentOption, ZPayOrderStatus } from "@/utils/type";
import { Modal, Button, Form, Input, Table } from "antd";
import {
  ExclamationCircleOutlined,
  LoadingOutlined,
  CreditCardOutlined,
  KeyOutlined,
  AlipayOutlined,
  WechatOutlined,
} from "@ant-design/icons";
import { ScrollableContainer } from "@/components/dictation/video/Widget";
import { formatTimestamp } from "../../utils/util";

const LoadingIcon: React.FC = () => {
  const { t } = useTranslation();
  return (
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
  );
};

const PlanCard: React.FC<PlanProps> = ({
  id,
  title,
  price,
  duration,
  features,
  isCurrent,
  toBeCanceled,
  currentPlan,
  onCancelSubscription,
  onSelect,
  onCancel,
}) => {
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { t } = useTranslation();
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const handleCancelSubscriptionClick = () => {
    setIsConfirmModalVisible(true);
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      await onCancelSubscription();
      setIsConfirmModalVisible(false);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div
      className={`
        relative rounded-lg p-4 sm:p-6 md:p-10
        dark:bg-gray-800 bg-white
        transition-all duration-300
        hover:border-2 hover:border-green-500
        dark:hover:border-orange-500
        hover:shadow-xl md:hover:scale-105
      `}
    >
      {isCurrent && (
        <span
          className="absolute -top-3 right-4 text-white px-3 py-1 rounded-full text-sm
                      bg-gradient-to-r from-green-500 to-green-600 hover:bg-gradient-to-r
                  dark:bg-gradient-to-r dark:from-orange-600 dark:to-gray-800 dark:text-orange-300"
        >
          {t("current")}
        </span>
      )}

      <h3 className="text-2xl font-bold text-center mb-4 dark:text-white">
        {t(title)}
      </h3>

      <div className="text-center h-[90px] mb-6">
        <div className="flex items-baseline justify-center">
          <span className="text-2xl font-semibold dark:text-white">¥</span>
          <span className="text-5xl font-bold mx-1 dark:text-white">
            {price}
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            {t(duration)}
          </span>
        </div>

        {isCurrent &&
          (currentPlan?.nextPaymentTime || currentPlan?.expireTime) && (
            <div className="mt-3 flex items-center justify-center text-sm">
              <div
                className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300
                          bg-gray-100 dark:bg-gray-700/50 rounded-full px-3 py-1.5"
              >
                <svg
                  className="w-4 h-4 text-orange-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs">
                  {currentPlan?.nextPaymentTime
                    ? t("nextPayment")
                    : t("expireTime")}
                  :
                </span>
                <span className="font-medium text-xs">
                  {formatTimestamp(
                    currentPlan.nextPaymentTime || currentPlan.expireTime!,
                    "date"
                  )}
                </span>
              </div>
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
              {t(feature.feature)}
            </span>
          </div>
        ))}
      </div>

      {/* For paid plans, show select button when not current or free user */}
      {id !== USER_PLAN.FREE &&
        !toBeCanceled &&
        (!isCurrent ||
          (isCurrent && currentPlan?.expireTime) ||
          currentPlan?.name === USER_PLAN.FREE) && (
          <button
            onClick={onSelect}
            disabled={
              currentPlan !== undefined &&
              (!isCurrent || (isCurrent && currentPlan?.expireTime !== null)) &&
              currentPlan?.name !== USER_PLAN.FREE
            }
            className={`
              w-full py-4 px-6 rounded-xl font-semibold text-center
              transition-all duration-300
              ${
                currentPlan !== undefined &&
                (!isCurrent ||
                  (isCurrent && currentPlan?.expireTime !== null)) &&
                currentPlan?.name !== USER_PLAN.FREE
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                  : "text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg dark:from-orange-500 dark:to-orange-600 dark:hover:from-orange-600 dark:hover:to-orange-700"
              }
              min-w-[200px] mx-auto block
            `}
          >
            {t("selectPlan")}
          </button>
        )}

      {isCurrent &&
        !currentPlan?.expireTime &&
        currentPlan?.name !== USER_PLAN.FREE && (
          <button
            onClick={handleCancelSubscriptionClick}
            className="w-full py-4 px-6 rounded-xl font-semibold text-center
            text-white bg-orange-500 hover:bg-orange-600
            dark:bg-red-600 dark:hover:bg-red-700
            transition-all duration-300 min-w-[200px] mx-auto block"
          >
            {t("cancelSubscription")}
          </button>
        )}
      {toBeCanceled && (
        <button
          onClick={onCancel}
          className="w-full py-4 px-6 rounded-xl font-semibold text-center
            text-gray-700 bg-gray-200 hover:bg-gray-300
            dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600
            transition-all duration-300 min-w-[200px] mx-auto block"
        >
          {t("cancel")}
        </button>
      )}

      <Modal
        title={
          <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
            <ExclamationCircleOutlined className="text-xl" />
            <span>{t("cancelSubscriptionConfirm")}</span>
          </div>
        }
        open={isConfirmModalVisible}
        onCancel={() => !isCancelling && setIsConfirmModalVisible(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsConfirmModalVisible(false)}
            disabled={isCancelling}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
          >
            {t("cancel")}
          </Button>,
          <Button
            key="confirm"
            type="primary"
            danger
            onClick={handleConfirmCancel}
            loading={isCancelling}
            icon={isCancelling ? <LoadingOutlined /> : null}
            className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {isCancelling ? t("cancelling") : t("confirm")}
          </Button>,
        ]}
        className="dark:bg-gray-800"
        maskClosable={!isCancelling}
        closable={!isCancelling}
        width={480}
        centered
      >
        <div className="py-4">
          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300 text-base mb-4">
              {t("cancelSubscriptionWarning")}
            </p>
            <div className="space-y-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-gray-600 dark:text-gray-300 text-sm">
                    1
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {t("cancelSubscriptionWarning1")}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-gray-600 dark:text-gray-300 text-sm">
                    2
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {t("cancelSubscriptionWarning2")}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-gray-600 dark:text-gray-300 text-sm">
                    3
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {t("cancelSubscriptionWarning3")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

interface SubscriptionOption {
  type: "recurring" | "onetime";
  price: number;
  description: string;
}

const PaymentOptions: React.FC<{
  onSelect: (
    method: string,
    subscriptionType: "recurring" | "onetime",
    paymentProvider?: string
  ) => void;
  planPrice: number;
  zpayPrice: number;
  isLoading?: boolean;
  selectedPayment?: string | null;
}> = ({
  onSelect,
  planPrice,
  zpayPrice,
  isLoading = false,
  selectedPayment = null,
}) => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<"recurring" | "onetime">(
    "recurring"
  );
  const [selectedProvider, setSelectedProvider] = useState<"stripe" | "zpay">(
    "zpay" // Default to ZPAY since Stripe is temporarily disabled
  );
  const [selectedZPayMethod, setSelectedZPayMethod] =
    useState<string>("alipay");

  const subscriptionOptions: SubscriptionOption[] = [
    {
      type: "recurring",
      price: selectedProvider === "stripe" ? planPrice : zpayPrice,
      description:
        selectedProvider === "stripe"
          ? t("autoRenewDescription")
          : t("onetimeDescription"), // ZPAY doesn't support recurring
    },
    {
      type: "onetime",
      price: selectedProvider === "stripe" ? planPrice * 1.2 : zpayPrice,
      description: t("onetimeDescription"),
    },
  ];

  // Payment provider options
  const paymentProviders: PaymentOption[] = [
    {
      provider: "zpay",
      method: "alipay",
      label: t("alipay"),
      currency: "CNY",
      icon: <AlipayOutlined className="text-blue-500" />,
    },
    {
      provider: "zpay",
      method: "wxpay",
      label: t("wechatPay"),
      currency: "CNY",
      icon: <WechatOutlined className="text-green-500" />,
      disabled: true,
    },
  ];

  // Filter subscription options based on provider
  const availableSubscriptionOptions =
    selectedProvider === "zpay"
      ? subscriptionOptions.filter((option) => option.type === "onetime")
      : subscriptionOptions;

  useEffect(() => {
    if (selectedPayment) {
      console.log(`Selected payment method: ${selectedPayment}`);
    }
  }, [selectedPayment]);

  // Auto-select onetime for ZPAY
  useEffect(() => {
    if (selectedProvider === "zpay" && selectedType === "recurring") {
      setSelectedType("onetime");
    }
  }, [selectedProvider]);

  const handlePaymentProviderChange = (
    provider: "stripe" | "zpay",
    method?: string
  ) => {
    // Check if the provider is disabled
    const providerOption = paymentProviders.find(
      (p) =>
        p.provider === provider &&
        (provider === "stripe" || p.method === method)
    );

    if (providerOption?.disabled) {
      return; // Don't allow selection of disabled providers
    }

    setSelectedProvider(provider);
    if (provider === "zpay" && method) {
      setSelectedZPayMethod(method);
      setSelectedType("onetime"); // ZPAY only supports one-time payments
    }
  };

  const getCurrentPrice = () => {
    const basePrice = selectedProvider === "stripe" ? planPrice : zpayPrice;
    const finalPrice =
      selectedType === "onetime" && selectedProvider === "stripe"
        ? basePrice * 1.2
        : basePrice;
    const currency = selectedProvider === "stripe" ? "$" : "¥";
    return `${currency}${finalPrice}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold mb-6 pl-10 pr-10 dark:text-white">
        {t("selectPaymentMethod")}
      </h3>

      {/* Payment Provider Selection */}
      <div className="space-y-3">
        <h4 className="text-lg font-medium dark:text-white mb-3">
          {t("paymentProvider")}
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {paymentProviders.map((provider) => (
            <div
              key={`${provider.provider}-${provider.method}`}
              onClick={() =>
                !provider.disabled &&
                handlePaymentProviderChange(provider.provider, provider.method)
              }
              className={`
                p-4 rounded-xl border-2 transition-all duration-200
                ${
                  provider.disabled
                    ? "cursor-not-allowed opacity-60 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                    : selectedProvider === provider.provider &&
                      (provider.provider === "stripe" ||
                        selectedZPayMethod === provider.method)
                    ? "cursor-pointer border-green-500 dark:border-orange-500 bg-green-50 dark:bg-gray-700"
                    : "cursor-pointer border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-orange-400"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${
                        provider.disabled
                          ? "border-gray-300 dark:border-gray-500"
                          : selectedProvider === provider.provider &&
                            (provider.provider === "stripe" ||
                              selectedZPayMethod === provider.method)
                          ? "border-green-500 dark:border-orange-500"
                          : "border-gray-300 dark:border-gray-500"
                      }
                    `}
                  >
                    {!provider.disabled &&
                      selectedProvider === provider.provider &&
                      (provider.provider === "stripe" ||
                        selectedZPayMethod === provider.method) && (
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 dark:bg-orange-500" />
                      )}
                  </div>
                  <div className={provider.disabled ? "opacity-60" : ""}>
                    {provider.icon}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`font-medium ${
                        provider.disabled
                          ? "text-gray-400 dark:text-gray-500"
                          : "dark:text-white"
                      }`}
                    >
                      {provider.label}
                    </span>
                    {provider.disabled && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {t("temporarilyUnavailable")}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`text-sm ${
                    provider.disabled
                      ? "text-gray-400 dark:text-gray-500"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {provider.currency}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Type Selection */}
      <div className="space-y-3">
        <h4 className="text-lg font-medium dark:text-white mb-3">
          {t("subscriptionType")}
        </h4>
        {availableSubscriptionOptions.map((option) => (
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
              <span className="font-bold dark:text-white">
                {selectedProvider === "stripe" ? "$" : "¥"}
                {option.price}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-8">
              {option.description}
            </p>
          </div>
        ))}
      </div>

      {/* Payment Button */}
      <button
        onClick={async () => {
          try {
            const paymentMethod =
              selectedProvider === "zpay" ? selectedZPayMethod : "stripe";
            await onSelect(paymentMethod, selectedType, selectedProvider);
          } catch (error) {
            console.error("Error selecting payment method:", error);
          }
        }}
        disabled={
          isLoading ||
          paymentProviders.find(
            (p) =>
              p.provider === selectedProvider &&
              (selectedProvider === "stripe" || p.method === selectedZPayMethod)
          )?.disabled
        }
        className={`
          w-full py-4 px-6 rounded-xl font-semibold
          flex items-center justify-center space-x-3
          transition-all duration-300
          ${
            isLoading ||
            paymentProviders.find(
              (p) =>
                p.provider === selectedProvider &&
                (selectedProvider === "stripe" ||
                  p.method === selectedZPayMethod)
            )?.disabled
              ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 dark:from-orange-500 dark:to-orange-600 dark:hover:from-orange-600 dark:hover:to-orange-700"
          }
          text-white shadow-md hover:shadow-lg
        `}
      >
        {isLoading ? (
          <LoadingIcon />
        ) : (
          <>
            <CreditCardIcon className="h-5 w-5" />
            <span>
              {paymentProviders.find(
                (p) =>
                  p.provider === selectedProvider &&
                  (selectedProvider === "stripe" ||
                    p.method === selectedZPayMethod)
              )?.disabled
                ? t("temporarilyUnavailable")
                : `${t("clickToPay")} ${getCurrentPrice()}`}
            </span>
          </>
        )}
      </button>
    </motion.div>
  );
};

export const UpgradePlan: React.FC = () => {
  const { t } = useTranslation();
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState("code");
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [statusPollingInterval, setStatusPollingInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [countdownInterval, setCountdownInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await api.verifyPaymentSession(sessionId);
      if (response.data.status === "paid") {
        message.success("Payment successful!");
        const user = response.data.userInfo;
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

  const cancelSubscription = async () => {
    try {
      const response = await api.cancelSubscription();
      if (response.data.plan.status === "cancelled") {
        // update user plan in local storage
        const user = JSON.parse(localStorage.getItem(USER_KEY) || "{}");
        user.plan = response.data.plan;
        dispatch(setUser(user));
        message.success(t("subscriptionCanceledSuccessfully"));
      } else {
        message.error(t("failedToCancelSubscription"));
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
      message.error(t("failedToCancelSubscription"));
    } finally {
      // refresh the page
      window.location.reload();
    }
  };

  // Poll ZPAY order status with exponential backoff
  const pollZPayOrderStatus = async (
    orderId: string,
    attempt: number = 1,
    maxAttempts: number = 20
  ): Promise<ZPayOrderStatus> => {
    try {
      const response = await api.getZPayOrderStatus(orderId);
      const status = response.data;

      // If payment is completed or failed, return immediately
      if (
        status.status === "paid" ||
        status.status === "failed" ||
        status.status === "expired"
      ) {
        return status;
      }

      // If still pending and we haven't reached max attempts, retry with exponential backoff
      if (attempt < maxAttempts) {
        const delay = Math.min(1000 * Math.pow(1.5, attempt), 10000); // Cap at 10 seconds
        await new Promise((resolve) => setTimeout(resolve, delay));
        return pollZPayOrderStatus(orderId, attempt + 1, maxAttempts);
      }

      return status;
    } catch (error) {
      console.error("Error polling order status:", error);
      throw error;
    }
  };

  // Start status polling for ZPAY orders with improved error handling
  const startStatusPolling = (
    orderId: string,
    windowCloseChecker?: NodeJS.Timeout
  ) => {
    const interval = setInterval(async () => {
      try {
        const status = await pollZPayOrderStatus(orderId);

        // Handle any definitive status (not pending)
        if (status.status !== "pending") {
          // Stop polling
          clearInterval(interval);
          setStatusPollingInterval(null);

          // Clean up window close checker
          if (windowCloseChecker) {
            clearInterval(windowCloseChecker);
          }

          // Close modal
          setIsLoading(false);
          setCurrentOrderId(null);

          if (status.status === "paid") {
            // Payment successful
            message.success(t("paymentSuccessful"));

            // Update user info in global state
            if (status.userInfo) {
              dispatch(setUser(status.userInfo));
              // Store updated user info in localStorage
              localStorage.setItem(USER_KEY, JSON.stringify(status.userInfo));
            }

            // Refresh the page to show updated plan
            window.location.reload();
          } else if (
            status.status === "failed" ||
            status.status === "expired"
          ) {
            // Payment failed
            message.error(t("paymentFailed"));
          } else {
            // Unknown status
            message.warning(`${t("paymentStatus")}: ${status.status}`);
          }
        }
      } catch (error) {
        console.error("Error polling order status:", error);
        // On error, continue polling but don't close modal yet
        message.error(t("errorCheckingPaymentStatus"));
      }
    }, 3000); // Poll every 3 seconds

    setStatusPollingInterval(interval);

    // Stop polling after 10 minutes
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
        setStatusPollingInterval(null);
        setIsLoading(false);
        setCurrentOrderId(null);
        message.warning(t("paymentTimeout"));
      }
      if (windowCloseChecker) {
        clearInterval(windowCloseChecker);
      }
    }, 600000); // 10 minutes
  };

  // Cancel payment processing
  const cancelPayment = () => {
    if (statusPollingInterval) {
      clearInterval(statusPollingInterval);
      setStatusPollingInterval(null);
    }
    if (countdownInterval) {
      clearInterval(countdownInterval);
      setCountdownInterval(null);
    }
    setIsLoading(false);
    setCurrentOrderId(null);
    setCountdown(null);
  };

  const handleSelectPayment = async (
    method: string,
    subscriptionType: "recurring" | "onetime",
    paymentProvider?: string
  ) => {
    // Set selected payment method
    setSelectedPayment(method);

    try {
      setIsLoading(true);

      const duration =
        USER_PLAN_DURATION[
          selectedPlan!.toUpperCase() as keyof typeof USER_PLAN_DURATION
        ];

      if (paymentProvider === "zpay") {
        // ZPAY payment flow
        const response = await api.createZPayOrder(
          selectedPlan!,
          duration,
          method
        );
        setCurrentOrderId(response.data.orderId);

        // Open payment URL in new window
        const paymentWindow = window.open(
          response.data.paymentUrl,
          "zpay_payment",
          "width=800,height=600,scrollbars=yes,resizable=yes"
        );

        // Listen for window close (user returns)
        const orderId = response.data.orderId; // Store orderId in closure
        const checkClosed = setInterval(() => {
          if (paymentWindow?.closed) {
            clearInterval(checkClosed);

            // Start countdown when window closes
            setCountdown(30); // Set initial countdown value to 30 seconds
            const countdownTimer = setInterval(() => {
              setCountdown((prevCount) => {
                if (prevCount === null || prevCount <= 1) {
                  clearInterval(countdownTimer);
                  setCountdownInterval(null);
                  // Close popup and clean up when countdown ends
                  setIsLoading(false);
                  setCurrentOrderId(null);
                  message.info(t("paymentProcessTimeout"));
                  return null;
                }
                return prevCount - 1;
              });
            }, 1000);
            setCountdownInterval(countdownTimer);

            // Start polling immediately after window closes
            pollZPayOrderStatus(orderId)
              .then((status) => {
                if (status.status === "paid") {
                  // Payment was completed
                  setIsLoading(false);
                  setCurrentOrderId(null);
                  message.success(t("paymentSuccessful"));

                  // Update user info in global state and localStorage
                  if (status.userInfo) {
                    dispatch(setUser(status.userInfo));
                    localStorage.setItem(
                      USER_KEY,
                      JSON.stringify(status.userInfo)
                    );
                  }

                  // Refresh the page to show updated plan
                  window.location.reload();
                } else if (status.status === "pending") {
                  // Start regular polling if still pending
                  startStatusPolling(orderId);
                  message.info(t("processingPayment"));
                } else {
                  // Payment failed or expired
                  setIsLoading(false);
                  setCurrentOrderId(null);
                  message.error(t("paymentFailed"));
                }
              })
              .catch((error) => {
                console.error("Error checking payment status:", error);
                setIsLoading(false);
                setCurrentOrderId(null);
                message.error(t("errorCheckingPaymentStatus"));
              });
          }
        }, 1000);

        // Start initial polling
        startStatusPolling(orderId, checkClosed);
      } else {
        // Stripe payment flow
        const response = await api.createStripeSession(
          selectedPlan!,
          duration,
          subscriptionType === "recurring"
        );

        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Error creating payment session:", error);
      message.error(t("paymentInitFailed"));
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      setIsVerifying(true);
      const values = await verifyForm.validateFields();

      const response = await api.verifyMembershipCode(values.code);

      if (response.data && response.data.plan) {
        message.success("Membership activated successfully!");
        // Refresh user information
        await fetchUserInfo();
      }
    } catch (error: any) {
      console.error("Error verifying code:", error);
      if (error.response && error.response.data && error.response.data.error) {
        message.error(`Verification failed: ${error.response.data.error}`);
      } else {
        message.error("Failed to verify code. Please try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const fetchUserInfo = async () => {
    try {
      // Get current user email from Redux state
      const userEmail = userInfo?.email;

      if (!userEmail) {
        console.error("User email not found");
        return;
      }

      const response = await api.loadUserInfo(userEmail);
      if (response.data) {
        dispatch(setUser(response.data));
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  // Fetch payment history when tab is selected
  useEffect(() => {
    if (activeTab === "history") {
      setPaymentHistoryLoading(true);
      api
        .getZPayPaymentHistory()
        .then((res) => setPaymentHistory(res.data.orders || []))
        .catch(() => setPaymentHistory([]))
        .finally(() => setPaymentHistoryLoading(false));
    }
  }, [activeTab]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (statusPollingInterval) {
        clearInterval(statusPollingInterval);
      }
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [statusPollingInterval, countdownInterval]);

  useEffect(() => {
    // Verify payment session if session_id is in URL params
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      verifyPayment(sessionId);
    }

    // Get user plan info
    const fetchUserPlan = async () => {
      try {
        if (userInfo) {
          // For Free users, create a currentPlan object
          if (!userInfo.plan || userInfo.plan.name === USER_PLAN.FREE) {
            setCurrentPlan({
              name: USER_PLAN.FREE,
              expireTime: null,
              isRecurring: false,
            });
          } else {
            // For paid users, set their plan details
            setCurrentPlan(userInfo.plan);
          }
        }
      } catch (error) {
        console.error("Error fetching user plan:", error);
      }
    };

    fetchUserPlan();
  }, [userInfo, dispatch]);

  // 移动端渲染函数
  const renderMobileView = () => (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* 移动端标题栏 */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("choosePlanTitle")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("choosePlanDescription")}
            </p>
          </div>
        </div>
      </div>

      {/* 移动端标签页 */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab("code")}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "code"
                ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <KeyOutlined className="text-base" />
              <span>{t("activateWithCode")}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("plans")}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "plans"
                ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <CreditCardOutlined className="text-base" />
              <span>{t("purchasePlans")}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "history"
                ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <CreditCardOutlined className="text-base" />
              <span className="hidden xs:inline">{t("paymentHistory")}</span>
              <span className="xs:hidden">{t("history")}</span>
            </div>
          </button>
        </div>
      </div>

      {/* 移动端内容区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 激活码标签页 */}
        {activeTab === "code" && (
          <div className="max-w-sm mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                  <KeyOutlined className="text-2xl text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t("redeemMembershipCode")}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("enterVerificationCodeBelow")}
                </p>
              </div>

              <Form form={verifyForm} layout="vertical">
                <Form.Item
                  name="code"
                  label={<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("verificationCode")}</span>}
                  rules={[{ required: true, message: t("pleaseEnterVerificationCode") }]}
                >
                  <Input
                    placeholder={t("enterVerificationCode")}
                    className="dark:bg-gray-700 dark:text-white"
                    size="large"
                  />
                </Form.Item>

                <Form.Item className="mb-4">
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleVerifyCode}
                    loading={isVerifying}
                    className="w-full h-12 text-base font-medium"
                  >
                    {t("activateMembership")}
                  </Button>
                </Form.Item>
              </Form>

              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {t("verificationCodeDescription")}
              </div>
            </div>
          </div>
        )}

        {/* 套餐选择标签页 */}
        {activeTab === "plans" && (
          <div>
            {!selectedPlan ? (
              <div className="space-y-4">
                {ZPAY_PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-700/50 ${
                      currentPlan?.name === plan.id ? 'border-blue-500 dark:border-blue-400' : ''
                    }`}
                  >
                    {currentPlan?.name === plan.id && (
                      <div className="absolute -top-2 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        {t("current")}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {t(plan.title)}
                        </h3>
                        <div className="flex items-baseline mt-1">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">¥{plan.price}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">/{t(plan.duration)}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {plan.id !== USER_PLAN.FREE && currentPlan?.name !== plan.id && (
                          <button
                            onClick={() => handleSelectPlan(plan.id)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            {t("selectPlan")}
                          </button>
                        )}
                      </div>
                    </div>

                    {currentPlan?.name === plan.id && (currentPlan?.nextPaymentTime || currentPlan?.expireTime) && (
                      <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="flex items-center text-sm text-orange-700 dark:text-orange-400">
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>
                            {currentPlan?.nextPaymentTime ? t("nextPayment") : t("expireTime")}: {" "}
                            {formatTimestamp(currentPlan.nextPaymentTime || currentPlan.expireTime!, "date")}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          {feature.included ? (
                            <CheckIcon className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XMarkIcon className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={`text-sm ${
                            feature.included
                              ? "text-gray-900 dark:text-gray-100"
                              : "text-gray-500 dark:text-gray-400"
                          }`}>
                            {t(feature.feature)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* 选中的套餐卡片 */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-blue-500 dark:border-blue-400">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t(ZPAY_PLANS.find((p) => p.id === selectedPlan)?.title || "")}
                      </h3>
                      <div className="flex items-baseline mt-1">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          ¥{ZPAY_PLANS.find((p) => p.id === selectedPlan)?.price}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                          /{t(ZPAY_PLANS.find((p) => p.id === selectedPlan)?.duration || "")}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPlan(null)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* 支付选项 */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                  <PaymentOptions
                    onSelect={handleSelectPayment}
                    planPrice={ZPAY_PLANS.find((p) => p.id === selectedPlan)?.price || 0}
                    zpayPrice={ZPAY_PLANS.find((p) => p.id === selectedPlan)?.price || 0}
                    isLoading={isLoading}
                    selectedPayment={selectedPayment}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 支付历史标签页 */}
        {activeTab === "history" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t("paymentHistory")}
            </h3>
            {paymentHistoryLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingOutlined className="text-2xl text-blue-500" />
              </div>
            ) : paymentHistory.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <CreditCardOutlined className="text-3xl" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">{t("noPaymentHistory")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentHistory.map((order) => (
                  <div key={order.orderId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{order.planName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {t("orderId")}: {order.orderId}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        order.status === 'paid' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {order.status}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">¥{order.amount}</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {order.paidAt ? formatTimestamp(order.paidAt, "date") : formatTimestamp(order.createdAt, "date")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // 桌面端渲染函数
  const renderDesktopView = () => (
    <ScrollableContainer>
      <div className="text-center mb-8 mt-8">
        <h2 className="text-3xl font-bold mb-2 dark:text-white">
          {t("choosePlanTitle")}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {t("choosePlanDescription")}
        </p>
      </div>

        <div className="w-full px-2 md:px-8 mb-8">
        {/* Custom tab component with better dark mode support */}
        <div className="flex justify-center mb-6">
          <div className="relative flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 shadow-md">
            {/* Activate with Code Tab */}
            <button
              onClick={() => setActiveTab("code")}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-200 ${
                activeTab === "code"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
              }`}
            >
              {activeTab === "code" && (
                <motion.div
                  layoutId="active-tab-marker"
                  className="absolute inset-0 rounded-md bg-white dark:bg-gray-700 shadow-sm z-0"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <KeyOutlined />
                <span>{t("activateWithCode")}</span>
              </span>
            </button>
            {/* Purchase Plans Tab */}
            <button
              onClick={() => setActiveTab("plans")}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-200 ${
                activeTab === "plans"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
              }`}
            >
              {activeTab === "plans" && (
                <motion.div
                  layoutId="active-tab-marker"
                  className="absolute inset-0 rounded-md bg-white dark:bg-gray-700 shadow-sm z-0"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <CreditCardOutlined />
                <span>{t("purchasePlans")}</span>
              </span>
            </button>
            {/* Payment History Tab */}
            <button
              onClick={() => setActiveTab("history")}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-200 ${
                activeTab === "history"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
              }`}
            >
              {activeTab === "history" && (
                <motion.div
                  layoutId="active-tab-marker"
                  className="absolute inset-0 rounded-md bg-white dark:bg-gray-700 shadow-sm z-0"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <CreditCardOutlined />
                <span>{t("paymentHistory")}</span>
              </span>
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="mt-6">
          {/* Payment History Tab Content */}
          {activeTab === "history" && (
            <div
              className="bg-white dark:bg-gray-800 p-4 md:p-8 rounded-xl shadow-lg"
              style={{ overflow: "visible" }}
            >
              <div style={{ width: "100%" }}>
                <Table
                  loading={paymentHistoryLoading}
                  dataSource={paymentHistory}
                  rowKey="orderId"
                  pagination={{ pageSize: 8 }}
                  scroll={{ x: "max-content", y: 320 }}
                  columns={[
                    {
                      title: t("orderId"),
                      dataIndex: "orderId",
                      key: "orderId",
                    },
                    {
                      title: t("plan"),
                      dataIndex: "planName",
                      key: "planName",
                    },
                    { title: t("amount"), dataIndex: "amount", key: "amount" },
                    {
                      title: t("paymentType"),
                      dataIndex: "payType",
                      key: "payType",
                    },
                    { title: t("status"), dataIndex: "status", key: "status" },
                    {
                      title: t("createdAt"),
                      dataIndex: "createdAt",
                      key: "createdAt",
                      render: (text) =>
                        text ? formatTimestamp(text, "locale") : "-",
                    },
                    {
                      title: t("paidAt"),
                      dataIndex: "paidAt",
                      key: "paidAt",
                      render: (text) =>
                        text ? formatTimestamp(text, "locale") : "-",
                    },
                  ]}
                  locale={{
                    emptyText: paymentHistoryLoading
                      ? ""
                      : t("noPaymentHistory"),
                  }}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          )}
          {/* Purchase plans content */}
          {activeTab === "plans" && (
            <AnimatePresence mode="wait">
              {!selectedPlan ? (
                <motion.div
                  key="plans"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-6"
                >
                  {ZPAY_PLANS.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      {...plan}
                      isCurrent={currentPlan?.name === plan.id}
                      currentPlan={currentPlan}
                      onSelect={() => handleSelectPlan(plan.id)}
                      onCancel={() => setSelectedPlan(null)}
                      onCancelSubscription={() => cancelSubscription()}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col lg:flex-row justify-center items-start gap-8 max-w-5xl mx-auto mt-6"
                >
                  <div className="w-full lg:w-2/5">
                    <div className="sticky top-8">
                      <PlanCard
                        {...ZPAY_PLANS.find((p) => p.id === selectedPlan)!}
                        toBeCanceled={true}
                        onSelect={() => {}}
                        onCancel={() => setSelectedPlan(null)}
                        onCancelSubscription={() => {}}
                      />
                    </div>
                  </div>

                  <div className="w-full lg:w-3/5 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
                    <div className="max-w-lg mx-auto">
                      <PaymentOptions
                        onSelect={handleSelectPayment}
                        planPrice={
                          ZPAY_PLANS.find((p) => p.id === selectedPlan)
                            ?.price || 0
                        }
                        zpayPrice={
                          ZPAY_PLANS.find((p) => p.id === selectedPlan)
                            ?.price || 0
                        }
                        isLoading={isLoading}
                        selectedPayment={selectedPayment}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Activate code content */}
          {activeTab === "code" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto mt-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg"
            >
              {/* Code redemption form */}
              <div className="text-center mb-6">
                <div className="text-blue-500 mb-4 text-4xl">
                  <KeyOutlined />
                </div>
                <h3 className="text-xl font-bold dark:text-white">
                  {t("redeemMembershipCode")}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  {t("enterVerificationCodeBelow")}
                </p>
              </div>

              {/* Verification code input form */}
              <Form form={verifyForm} layout="vertical">
                <Form.Item
                  name="code"
                  label={
                    <span className="dark:text-white">
                      {t("verificationCode")}
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: t("pleaseEnterVerificationCode"),
                    },
                  ]}
                >
                  <Input
                    placeholder={t("enterVerificationCode")}
                    className="dark:bg-gray-700 dark:text-white"
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleVerifyCode}
                    loading={isVerifying}
                    className="w-full"
                  >
                    {t("activateMembership")}
                  </Button>
                </Form.Item>
              </Form>

              {/* Help text */}
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                <p>{t("verificationCodeDescription")}</p>
              </div>
            </motion.div>
          )}

          {/* Manage subscription content */}
          {activeTab === "manage" &&
            currentPlan &&
            currentPlan.name !== USER_PLAN.FREE && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto mt-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg"
              >
                {/* Current membership details */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold dark:text-white">
                    {t("currentMembership")}
                  </h3>
                </div>

                {/* Membership information */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium dark:text-white">
                      {t("plan")}:
                    </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {t(currentPlan.name.toLowerCase() + "Plan")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium dark:text-white">
                      {t("status")}:
                    </span>
                    <span className="font-medium">
                      {currentPlan.isRecurring === true ? (
                        <span className="text-green-600 dark:text-green-400">
                          {t("activeRecurring")}
                        </span>
                      ) : (
                        <span className="text-blue-600 dark:text-blue-400">
                          {t("active")}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium dark:text-white">
                      {t("expires")}:
                    </span>
                    <span className="font-medium dark:text-white">
                      {currentPlan.expireTime
                        ? formatTimestamp(currentPlan.expireTime)
                        : t("notAvailable")}
                    </span>
                  </div>
                </div>

                {/* Cancel subscription button (only for recurring plans) */}
                {currentPlan.isRecurring === true && (
                  <Button
                    danger
                    size="large"
                    onClick={() => {
                      Modal.confirm({
                        title: t("cancelSubscriptionConfirm"),
                        icon: <ExclamationCircleOutlined />,
                        content: t("cancelSubscriptionWarning"),
                        onOk: cancelSubscription,
                      });
                    }}
                    className="w-full"
                  >
                    {t("cancelSubscription")}
                  </Button>
                )}
              </motion.div>
            )}
        </div>
      </div>

      {/* ZPAY Payment Processing Modal */}
      <Modal
        title={t("processingPayment")}
        open={isLoading && currentOrderId !== null}
        onCancel={cancelPayment}
        footer={[
          <Button key="cancel" onClick={cancelPayment}>
            {t("cancel")}
          </Button>,
        ]}
        closable={false}
        width={480}
        centered
      >
        <div className="text-center py-4">
          <LoadingOutlined className="text-4xl text-blue-500 mb-4" />
          <div className="mt-4">
            <p className="text-lg font-medium dark:text-white mb-2">
              {countdown !== null
                ? t("waitingForPayment")
                : t("pleaseCompletePayment")}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t("orderId")}: {currentOrderId}
            </p>
            {countdown !== null ? (
              <div className="mt-3">
                <p className="text-sm text-orange-600 dark:text-orange-400 mb-2">
                  {t("paymentWindowClosedWaiting")}
                </p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                    <span className="text-orange-600 dark:text-orange-400 font-bold text-sm">
                      {countdown}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("secondsRemaining")}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("paymentDetectionMessage")}
              </p>
            )}
          </div>
        </div>
      </Modal>
    </ScrollableContainer>
  );

  return (
    <>
      {/* 大屏幕版本 - 768px及以上 */}
      <div className="hidden md:block h-full">
        {renderDesktopView()}
      </div>
      
      {/* 小屏幕版本 - 768px以下 */}
      <div className="block md:hidden h-full">
        {renderMobileView()}
      </div>
    </>
  );
};
