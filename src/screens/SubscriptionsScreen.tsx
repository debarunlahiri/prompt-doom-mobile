import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import { SafeAreaView } from "react-native-safe-area-context";
import { getErrorMessage, subscriptionApi } from "../api";
import { CurrentSubscriptionCard } from "../components/CurrentSubscriptionCard";
import { ScreenState } from "../components";
import { useColors } from "../hooks/useColors";
import { styles } from "../styles";
import { SubscriptionPlan, UserSubscription } from "../types";

const formatMoney = (paise: number) =>
  `₹${(paise / 100).toLocaleString("en-IN")}`;
const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
        new Date(value.replace(" ", "T")),
      )
    : "Not scheduled";

export function SubscriptionsScreen() {
  const colors = useColors();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null,
  );
  const [renewalReminderDue, setRenewalReminderDue] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyPlanId, setBusyPlanId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await subscriptionApi.list();
      setPlans(data.plans);
      setSubscription(data.subscription);
      setRenewalReminderDue(data.renewalReminderDue);
    } catch (error) {
      Alert.alert("Unable to load subscriptions", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const subscribe = async (plan: SubscriptionPlan) => {
    setBusyPlanId(plan.id);
    try {
      const checkout = await subscriptionApi.checkout(plan.id);
      const payment = await RazorpayCheckout.open({
        key: checkout.keyId,
        subscription_id: checkout.subscriptionId,
        name: checkout.businessName,
        description: checkout.description,
        amount: checkout.amountPaise,
        currency: checkout.currency,
        prefill: checkout.prefill,
        readonly: { name: true },
        theme: checkout.theme,
        modal: {
          confirm_close: true,
          animation: true,
        },
        retry: { enabled: true, max_count: 3 },
      });
      if (!payment.razorpay_payment_id || !payment.razorpay_signature) {
        throw new Error("Razorpay did not return payment verification details");
      }
      await subscriptionApi.verify(
        payment.razorpay_payment_id,
        checkout.subscriptionId,
        payment.razorpay_signature,
      );
      await load();
      Alert.alert(
        "Subscription activated",
        "Your payment is verified and ad-free access is now active.",
      );
    } catch (error) {
      Alert.alert("Subscription not started", getErrorMessage(error));
    } finally {
      setBusyPlanId(null);
    }
  };

  const cancel = () =>
    Alert.alert(
      "Cancel auto-renewal?",
      "Your ad-free access continues until the current paid cycle ends.",
      [
        { text: "Keep subscription", style: "cancel" },
        {
          text: "Cancel renewal",
          style: "destructive",
          onPress: async () => {
            try {
              await subscriptionApi.cancel();
              await load();
              Alert.alert(
                "Auto-renewal cancelled",
                "Your benefits remain active until the cycle ends.",
              );
            } catch (error) {
              Alert.alert("Unable to cancel", getErrorMessage(error));
            }
          },
        },
      ],
    );

  if (loading) {
    return <ScreenState colors={colors} loading />;
  }

  const active = subscription?.accessActive ?? false;
  const currentPlan = subscription
    ? plans.find((plan) => plan.id === subscription.planId)
    : undefined;
  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View
          style={{
            padding: 20,
            borderRadius: 22,
            backgroundColor: colors.primary,
          }}
        >
          <Ionicons
            name={active ? "shield-checkmark" : "sparkles"}
            size={34}
            color="#FFFFFF"
          />
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 25,
              fontWeight: "800",
              marginTop: 12,
            }}
          >
            {active ? "You are ad-free" : "Create without interruptions"}
          </Text>
          <Text style={{ color: "#FFFFFFCC", marginTop: 7, lineHeight: 20 }}>
            {active
              ? subscription.cancelAtCycleEnd
                ? `${subscription.planName} · cancelled, active until ${formatDate(subscription.currentEndAt)}`
                : `${subscription.planName} · next renewal ${formatDate(subscription.nextChargeAt || subscription.currentEndAt)}`
              : "Choose a recurring plan. Your feature list and pricing always come from Prompt Doom."}
          </Text>
        </View>
        {active && subscription ? (
          <CurrentSubscriptionCard
            subscription={subscription}
            plan={currentPlan}
            onManage={cancel}
          />
        ) : null}
        {renewalReminderDue && subscription ? (
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              padding: 14,
              borderRadius: 14,
              backgroundColor: colors.primarySoft,
              alignItems: "center",
            }}
          >
            <Ionicons name="notifications" size={22} color={colors.primary} />
            <Text style={{ color: colors.text, flex: 1, lineHeight: 19 }}>
              Your subscription is scheduled to renew on{" "}
              {formatDate(
                subscription.nextChargeAt || subscription.currentEndAt,
              )}
              .
            </Text>
          </View>
        ) : null}
        {plans.map((plan) => (
          <View
            key={plan.id}
            style={{
              padding: 20,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }}
          >
            <Text
              style={{ color: colors.text, fontSize: 20, fontWeight: "800" }}
            >
              {plan.name}
            </Text>
            <Text
              style={{
                color: colors.primary,
                fontSize: 28,
                fontWeight: "900",
                marginTop: 8,
              }}
            >
              {formatMoney(plan.amountPaise)}
              <Text
                style={{ color: colors.muted, fontSize: 14, fontWeight: "500" }}
              >
                {" "}
                / {plan.billingInterval === 1 ? "" : `${plan.billingInterval} `}
                {plan.billingPeriod.replace("ly", "")}
              </Text>
            </Text>
            {plan.description ? (
              <Text style={{ color: colors.muted, marginTop: 8 }}>
                {plan.description}
              </Text>
            ) : null}
            <View style={{ gap: 9, marginVertical: 16 }}>
              {plan.features.map((feature) => (
                <View
                  key={feature}
                  style={{ flexDirection: "row", gap: 9, alignItems: "center" }}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={{ color: colors.text, flex: 1 }}>{feature}</Text>
                </View>
              ))}
            </View>
            <Pressable
              disabled={busyPlanId !== null || Boolean(active)}
              onPress={() => subscribe(plan)}
              style={{
                minHeight: 50,
                borderRadius: 14,
                backgroundColor: active ? colors.border : colors.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {busyPlanId === plan.id ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>
                  {active
                    ? "Current subscription active"
                    : "Subscribe securely"}
                </Text>
              )}
            </Pressable>
          </View>
        ))}
        {!plans.length ? (
          <ScreenState
            colors={colors}
            empty="No subscription plans are available right now."
          />
        ) : null}
        <Text
          style={{ color: colors.muted, textAlign: "center", lineHeight: 19 }}
        >
          Payments and recurring mandates are completed securely by Razorpay.
          Renewal reminders are sent by the payment provider.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
