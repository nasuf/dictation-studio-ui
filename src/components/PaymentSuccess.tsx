import React from "react";
import { CheckCircleTwoTone } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

// Payment success page component
const PaymentSuccess: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div
      style={{
        minHeight: 400,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Success icon */}
      <CheckCircleTwoTone
        twoToneColor="#52c41a"
        style={{ fontSize: 72, marginBottom: 24 }}
      />
      {/* Success message */}
      <h2 style={{ marginBottom: 12 }}>{t("paymentSuccessful")}</h2>
      <p style={{ color: "#555", marginBottom: 32 }}>
        {t("paymentSuccessfulDescription")}
      </p>
    </div>
  );
};

export default PaymentSuccess;
