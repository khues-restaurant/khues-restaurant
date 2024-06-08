import { FaUtensils } from "react-icons/fa6";
import { type DBOrderSummary } from "~/server/api/routers/order";
import { motion } from "framer-motion";
import { useMainStore } from "~/stores/MainStore";
import { calculateRelativeTotal } from "~/utils/calculateRelativeTotal";
import { CiGift } from "react-icons/ci";
import { formatPrice } from "~/utils/formatPrice";
import Decimal from "decimal.js";
import Image from "next/image";
import { LuCakeSlice } from "react-icons/lu";

interface OrderSummary {
  order: DBOrderSummary;
}
function OrderSummary({ order }: OrderSummary) {
  const { customizationChoices, discounts } = useMainStore((state) => ({
    customizationChoices: state.customizationChoices,
    discounts: state.discounts,
  }));

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
      className="baseVertFlex w-full !items-start gap-4 rounded-md border-2 bg-gradient-to-br from-stone-100  
    to-stone-200/80 p-4"
    >
      <div className="baseFlex gap-1 text-base font-medium">
        <span>{numberOfItems}</span>
        <span>Items</span>
      </div>

      <div className="baseVertFlex mt-2 size-full !items-start !justify-start gap-2 rounded-md">
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
                <div className="baseVertFlex max-w-40 !items-start xs:max-w-80">
                  {/* item quantity, name, dietary restrictions */}
                  <div className="baseFlex !items-start gap-2 text-base font-medium">
                    <p>{item.quantity}</p>
                    <p>{item.name}</p>

                    {item.includeDietaryRestrictions && (
                      <div className="my-2 ml-1 size-2 shrink-0 rounded-full bg-primary/75" />
                    )}
                  </div>

                  <div className="baseVertFlex ml-4 w-full !items-start text-xs">
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
                      <div className="baseFlex my-1 gap-2 rounded-md border border-primary !px-2 !py-0.5 text-xs text-primary">
                        {item.pointReward ? (
                          <CiGift className="size-5" />
                        ) : (
                          <LuCakeSlice className="size-5 stroke-[1.5px]" />
                        )}
                        <p className="font-medium">
                          {item.pointReward ? (
                            <>
                              {new Decimal(item.price)
                                .mul(2) // item price (in cents) multiplied by 2
                                .toNumber()}{" "}
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
                  <p className="text-base">
                    {formatPrice(
                      calculateRelativeTotal({
                        items: [item],
                        customizationChoices,
                        discounts,
                      }),
                    )}
                  </p>
                  {item.discountId && (
                    <div className="baseFlex gap-2 rounded-md border border-primary !px-2 !py-1 text-xs text-primary">
                      {discounts[item.discountId]?.name.includes("Points") && (
                        <CiGift className="size-5" />
                      )}{" "}
                      {discounts[item.discountId]?.name.includes(
                        "Birthday",
                      ) && <LuCakeSlice className="size-5 stroke-[1.5px]" />}
                      <p>{discounts[item.discountId]?.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="baseVertFlex mt-8 w-full gap-4">
          {/* dietary restrictions legend */}
          {/* is only rendered if there is an item with "includeDietaryRestrictions" */}
          {order.orderItems.some((item) => item.includeDietaryRestrictions) && (
            <div className="baseVertFlex mb-4 w-64 gap-2 sm:w-auto">
              <div className="baseFlex gap-4">
                <div className="size-2 shrink-0 rounded-full bg-primary/75" />
                <p className="text-sm">
                  Item will be prepared according to your dietary restrictions:
                </p>
              </div>
              <p className="text-sm italic">
                &ldquo;{order.dietaryRestrictions}&rdquo;
              </p>
            </div>
          )}

          <div className="baseFlex w-full">
            <div className="baseFlex gap-2 text-sm italic text-stone-400">
              <FaUtensils className="size-4" />
              <p className="min-w-fit">
                Napkins and utensils{" "}
                {order.includeNapkinsAndUtensils ? "were" : "were not"}{" "}
                requested.
              </p>
            </div>
          </div>
        </div>

        <div className="baseVertFlex w-full border-t border-stone-300 p-4">
          <div className="baseFlex w-full !justify-between gap-2 text-sm">
            <p>Subtotal</p>
            <p>{formatPrice(order.subtotal)}</p>
          </div>

          <div className="baseFlex w-full !justify-between gap-2 text-sm">
            <p>Tax</p>
            <p>{formatPrice(order.tax)}</p>
          </div>

          {order.tipValue !== 0 && (
            <div className="baseFlex w-full !justify-between gap-2 text-sm">
              <p>
                {`Tip${order.tipPercentage !== null ? ` (${order.tipPercentage}%)` : ""}`}
              </p>
              <p>{formatPrice(order.tipValue)}</p>
            </div>
          )}

          <div className="baseFlex w-full !justify-between gap-2 text-lg font-semibold">
            <p>Total</p>
            <p>{formatPrice(order.total)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
export default OrderSummary;
