import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useColors } from "../hooks/useColors";
import { SubscriptionPlan, UserSubscription } from "../types";

type Props = {
  subscription: UserSubscription;
  plan?: SubscriptionPlan;
  onManage: () => void;
};

const billingPeriodLabels: Record<SubscriptionPlan["billingPeriod"], string> = {
  daily: "day",
  weekly: "week",
  monthly: "month",
  yearly: "year",
};

const formatMoney = (paise: number) =>
  `₹${(paise / 100).toLocaleString("en-IN")}`;

const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
        new Date(value.replace(" ", "T")),
      )
    : "Not scheduled";

export function CurrentSubscriptionCard({
  subscription,
  plan,
  onManage,
}: Props) {
  const colors = useColors();
  const renewalAt = subscription.cancelAtCycleEnd
    ? subscription.currentEndAt
    : subscription.nextChargeAt || subscription.currentEndAt;
  const billingCycle = plan
    ? `Every ${plan.billingInterval === 1 ? "" : `${plan.billingInterval} `}${billingPeriodLabels[plan.billingPeriod]}`
    : null;

  return (
    <View
      style={{
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        gap: 16,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Ionicons
            name="shield-checkmark"
            size={24}
            color={colors.primary}
          />
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800" }}>
            Current subscription
          </Text>
        </View>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 999,
            backgroundColor: colors.primarySoft,
          }}
        >
          <Text style={{ color: colors.primary, fontWeight: "800" }}>
            {subscription.cancelAtCycleEnd ? "Plan active" : "Active"}
          </Text>
        </View>
      </View>

      <View>
        <Text style={{ color: colors.text, fontSize: 21, fontWeight: "800" }}>
          {subscription.planName}
        </Text>
        {plan ? (
          <Text style={{ color: colors.primary, marginTop: 6, fontWeight: "700" }}>
            {formatMoney(plan.amountPaise)} · {billingCycle}
          </Text>
        ) : null}
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 9,
        }}
      >
        <Ionicons name="calendar-outline" size={20} color={colors.muted} />
        <View>
          <Text style={{ color: colors.muted, fontSize: 12 }}>
            {subscription.cancelAtCycleEnd ? "Access until" : "Next renewal"}
          </Text>
          <Text style={{ color: colors.text, marginTop: 2, fontWeight: "700" }}>
            {formatDate(renewalAt)}
          </Text>
        </View>
      </View>

      {subscription.cancelAtCycleEnd ? (
        <View
          style={{
            padding: 14,
            borderRadius: 14,
            backgroundColor: colors.primarySoft,
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <Ionicons
            name="information-circle"
            size={20}
            color={colors.primary}
          />
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ color: colors.text, fontWeight: "800" }}>
              Subscription cancelled
            </Text>
            <Text style={{ color: colors.muted, lineHeight: 19 }}>
              Your plan remains active until {formatDate(renewalAt)}. You will
              not be charged again.
            </Text>
          </View>
        </View>
      ) : (
        <Pressable onPress={onManage} style={{ alignSelf: "flex-start" }}>
          <Text style={{ color: colors.primary, fontWeight: "800" }}>
            Manage auto-renewal
          </Text>
        </Pressable>
      )}
    </View>
  );
}
