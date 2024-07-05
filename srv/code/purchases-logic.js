/**
 * @On(event = { "CREATE" }, entity = "sample_projectSrv.Purchases")
 * @param {Object} request - User information, tenant-specific CDS model, headers and query parameters
 */
module.exports = async function(request) {
    const { Purchases, Customers } = cds.entities;

    // Calculate reward points as one tenth of the purchase value
    const rewardPoints = Math.floor(request.data.purchaseValue / 10);
    request.data.rewardPoints = rewardPoints;

    // Retrieve the related customer to update their total purchase value and total reward points
    if (request.data.customer_ID) {
        const customer = await SELECT.one.from(Customers).where({ ID: request.data.customer_ID });

        if (customer) {
            const updatedTotalPurchaseValue = customer.totalPurchaseValue + request.data.purchaseValue;
            const updatedTotalRewardPoints = customer.totalRewardPoints + rewardPoints;

            // Update the customer's total purchase value and total reward points
            await UPDATE(Customers)
                .set({
                    totalPurchaseValue: updatedTotalPurchaseValue,
                    totalRewardPoints: updatedTotalRewardPoints
                })
                .where({ ID: customer.ID });
        }
    }
}