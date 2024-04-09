import React, { useEffect, useState } from "react";
import { FaCakeCandles, FaUtensils } from "react-icons/fa6";
import { type DBOrderSummary } from "~/server/api/routers/order";
import { motion } from "framer-motion";
import { useMainStore } from "~/stores/MainStore";
import { calculateRelativeTotal } from "~/utils/calculateRelativeTotal";
import { CiGift } from "react-icons/ci";
import { calculateTotalCartPrices } from "~/utils/calculateTotalCartPrices";
import { formatPrice } from "~/utils/formatPrice";
import Decimal from "decimal.js";
import Image from "next/image";

interface OrderCost {
  subtotal: number;
  tax: number;
  total: number;
}

interface OrderSummary {
  order: DBOrderSummary;
}
function OrderSummary({ order }: OrderSummary) {
  const { customizationChoices, discounts } = useMainStore((state) => ({
    customizationChoices: state.customizationChoices,
    discounts: state.discounts,
  }));

  const [orderCost, setOrderCost] = useState<OrderCost>({
    subtotal: 0,
    tax: 0,
    total: 0,
  });

  useEffect(() => {
    setOrderCost(
      calculateTotalCartPrices({
        items: order.orderItems,
        customizationChoices,
        discounts,
      }),
    );
  }, [order, customizationChoices, discounts]);

  const numberOfItems = order.orderItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );
  return (
    <motion.div
      key={`${order.id}-summary`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex w-full !items-start gap-4 rounded-md border-2 bg-gradient-to-br from-gray-100  
    to-gray-200/80 p-4"
    >
      <div className="baseFlex gap-1 text-lg">
        <span>{numberOfItems}</span>
        <span className="">Items</span>
      </div>

      <div className="baseVertFlex h-full w-full !items-start !justify-start gap-2 rounded-md">
        <div className="baseVertFlex w-full gap-4">
          {order.orderItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                opacity: { duration: 0.1 },
                delay: idx * 0.05,
              }}
              className="baseFlex w-full !items-start gap-4"
            >
              {/* preview image of item */}
              <Image
                src={"/menuItems/sampleImage.webp"}
                alt={item.name}
                width={48}
                height={48}
                className="rounded-md"
              />

              <div className="baseFlex w-full !items-start !justify-between">
                <div className="baseVertFlex !items-start">
                  {/* item quantity, name, dietary restrictions */}
                  <div className="baseFlex !items-start gap-2">
                    <p>{item.quantity}</p>
                    <p>{item.name}</p>

                    {item.includeDietaryRestrictions && (
                      <div className="size-2 rounded-full bg-primary/25" />
                    )}
                  </div>

                  <div className="baseVertFlex w-full !items-start text-sm">
                    {Object.values(item.customizations).map((choiceId, idx) => (
                      <p key={idx}>
                        -{" "}
                        {
                          customizationChoices[choiceId]?.customizationCategory
                            .name
                        }
                        : {customizationChoices[choiceId]?.name}
                      </p>
                    ))}
                    {item.specialInstructions && (
                      <p>- {item.specialInstructions}</p>
                    )}

                    {/* reward name + icon */}
                    {(item.pointReward || item.birthdayReward) && (
                      <div className="baseFlex gap-2 rounded-md bg-primary px-1 py-0.5 text-xs font-semibold text-white">
                        {item.pointReward ? (
                          <CiGift className="size-5" />
                        ) : (
                          <FaCakeCandles className="size-5" />
                        )}
                        <p>
                          {item.pointReward ? (
                            <>
                              {new Decimal(item.price).div(0.01).toNumber()}{" "}
                              point reward
                            </>
                          ) : (
                            "Birthday reward"
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="baseVertFlex !items-end">
                  <p>
                    {formatPrice(
                      calculateRelativeTotal({
                        items: [item],
                        customizationChoices,
                        discounts,
                      }),
                    )}
                  </p>
                  {item.discountId && (
                    <div className="baseFlex gap-2 rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-white">
                      {discounts[item.discountId]?.name.includes("Points") && (
                        <CiGift className="size-5" />
                      )}{" "}
                      {discounts[item.discountId]?.name.includes(
                        "Birthday",
                      ) && <FaCakeCandles className="size-5" />}
                      <p>{discounts[item.discountId]?.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="baseVertFlex mt-8 w-full !items-start gap-4">
          {/* dietary restrictions legend */}
          {/* is only rendered if there is an item with "includeDietaryRestrictions" */}
          {order.orderItems.some((item) => item.includeDietaryRestrictions) && (
            <div className="baseVertFlex gap-2">
              <div className="baseFlex gap-2">
                <div className="size-2 rounded-full bg-primary/25" />
                <p className="text-sm">
                  Item will be prepared according to your dietary restrictions:
                </p>
              </div>
              <p className="text-sm">{order.dietaryRestrictions}</p>
            </div>
          )}

          <div className="baseFlex w-full">
            <div className="baseFlex gap-2 text-sm italic text-gray-400">
              <FaUtensils className="size-4" />
              <p>
                Napkins and utensils{" "}
                {order.includeNapkinsAndUtensils ? "were" : "were not"}{" "}
                requested.
              </p>
            </div>
          </div>
        </div>

        <div className="baseVertFlex w-full border-t border-gray-300 p-4">
          <div className="baseFlex w-full !justify-between gap-2 text-sm">
            <p>Subtotal</p>
            <p>{formatPrice(orderCost.subtotal)}</p>
          </div>

          <div className="baseFlex w-full !justify-between gap-2 text-sm">
            <p>Tax</p>
            <p>{formatPrice(orderCost.tax)}</p>
          </div>

          <div className="baseFlex w-full !justify-between gap-2 text-lg font-semibold">
            <p>Total</p>
            <p>{formatPrice(orderCost.total)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
export default OrderSummary;
