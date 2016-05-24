
namespace Youbora.Analytics.Models.Content
{
    public enum TransactionType
    {
        /// <summary>
        /// Media for rental.
        /// </summary>
        Rent,

        /// <summary>
        /// Media which has been acquired as part of a subscription.
        /// </summary>
        Subscription,

        /// <summary>
        /// EST (Electronic Sell Through). Media purchased.
        /// </summary>
        ElectronicSellThrough,

        /// <summary>
        /// Media which has no economical transaction.
        /// </summary>
        Free
    }
}
