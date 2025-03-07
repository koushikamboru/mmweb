import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { IconLoader2 } from "@tabler/icons-react";
import Link from "next/link";

// Define the Razorpay payment response type
interface RazorpayPaymentResponse {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
}

// Define a new interface that matches the data from your 'users' table
interface UserData {
    user_id: string;
    is_eligible_for_free_pass: boolean;
    phone_number: string | null;
    full_name: string | null;
}

const MyTicket = ({     user,
    changeTab,
}: {
    user: User;
    changeTab: (tab: 0 | 1 | 2 | 3 | 4) => void;
}) =>  {
    const [ticketPurchased, setTicketPurchased] = useState(false);
    const [ticketPrice, setTicketPrice] = useState(500); // Default ticket price
    const [isEligibleForFreePass, setIsEligibleForFreePass] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [transactionId, setTransactionId] = useState<string | null>(null); // Track transaction ID
    const [userDetails, setUserDetails] = useState<UserData | null>(null); // Track user details
    const router = useRouter();

    useEffect(() => {
        const fetchPaymentInfo = async () => {
            setLoading(true);

            try {
                // Fetch the user details including full_name and phone_number
                const { data: userData, error: userError } = await supabase
                    .from("users")
                    .select("user_id, is_eligible_for_free_pass, phone_number, full_name")
                    .eq("email", user.email)
                    .single();

                if (userError) {
                    console.error("Error fetching user data:", userError.message);
                } else {
                    setUserDetails(userData);
                    if (userData?.is_eligible_for_free_pass) {
                        // User is eligible for a free pass
                        setIsEligibleForFreePass(true);
                        setTicketPurchased(true); // Consider ticket purchased for free pass users
                    } else {
                        setIsEligibleForFreePass(false);

                        // Fetch the user's payment information
                        const { data: payments, error: paymentError } = await supabase
                            .from("payments")
                            .select("*")
                            .eq("user_id", userData.user_id)
                            .eq("payment_status", "paid");

                        if (paymentError) {
                            setErrorMessage("Error fetching payment information.");
                            console.error("Error fetching payments:", paymentError.message);
                        } else if (payments && payments.length > 0) {
                            setTicketPurchased(true); // User has purchased a ticket
                        }
                    }
                }
            } catch (error) {
                setErrorMessage("An unexpected error occurred.");
                console.error("Error:", error);
            }

            setLoading(false);
        };

        fetchPaymentInfo();
    }, [user.email]);

    const handlePaymentSuccess = async (paymentResponse: RazorpayPaymentResponse) => {
        const txnId = paymentResponse.razorpay_payment_id; // Use the Razorpay payment ID

        // Insert payment details into payments table
        const { error } = await supabase.from("payments").insert({
            user_id: userDetails?.user_id,
            amount: ticketPrice,
            payment_status: "paid",
            payment_id: txnId, // Use the Razorpay payment ID
            created_at: new Date().toISOString(),
        });

        if (error) {
            setErrorMessage("Error processing payment.");
            console.error("Error inserting payment:", error.message);
        } else {
            setTransactionId(txnId); // Save the transaction ID in state
            setTicketPurchased(true);
            router.push("/account"); // Redirect to the account page
        }
    };

    const handleRazorpayPayment = async () => {
        const res = await loadRazorpayScript();

        if (!res) {
            setErrorMessage("Razorpay SDK failed to load. Are you online?");
            return;
        }

        const options = {
            key: "rzp_live_JXXvFjARDIcDEl", // Replace with your Razorpay API key
            amount: ticketPrice * 100, // Convert price to paise (1 INR = 100 paise)
            currency: "INR",
            name: "Mohana Mantra",
            description: "MOHANA MANTRA 2K24 (OUT-HOUSE)", // Updated payment title
            handler: handlePaymentSuccess,
            prefill: {
                name: userDetails?.full_name || "Guest", // Use fetched user name
                email: user.email,
                contact: userDetails?.phone_number || "", // Use the fetched phone number
            },
            theme: {
                color: "#528FF0",
            },
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if ((window as any).Razorpay) {
                resolve(true);
            } else {
                const script = document.createElement("script");
                script.src = "https://checkout.razorpay.com/v1/checkout.js";
                script.onload = () => resolve(true);
                script.onerror = () => resolve(false);
                document.body.appendChild(script);
            }
        });
    };

    useEffect(() => {
        loadRazorpayScript(); // Load the Razorpay script when the component mounts
    }, []);

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <IconLoader2 className="animate-spin h-12 aspect-square" />
            </div>
        );
    }

    return (
        <div>
            {isEligibleForFreePass ? (
                // User is eligible for free pass
                <div className="text-center flex flex-col items-center py-16">
                    <h2 className="text-3xl font-bold">Congratulations!</h2>
                    <p className="text-green-500 mt-4">
                        You are eligible for a free pass to Mohana Mantra 2K24!
                    </p>
                    <p className="mt-2">
                        You can collect your pass on campus by showing your respective institution
                        ID card.
                    </p>
                    <h4 className="text-red-500 font-bold mt-4">
                        Please carry your ID card for the event.
                    </h4>
                  
                        <button 
                            className="bg-blue-600 hover:bg-blue-700 text-white mt-4 p-2 rounded-md"
                            onClick={() => changeTab(2)}
                            >
                            Select Interested Events
                        </button>
    
                </div>
            ) : (
                // User is not eligible for free pass
                <div>
                    {ticketPurchased ? (
                        <div className="text-center flex flex-col items-center py-16">
                            <h2 className="text-2xl font-bold">Thank You for Registering!</h2>
                            <p className="text-green-500 mt-4">
                                You have successfully registered for the event.
                            </p>
                            <p className="mt-4">
                                You can navigate to the <strong>My Payment</strong> tab to see your
                                payment details.
                            </p>
                            <Link
                                href="https://mohanamantra.com/account?tab=events-list"
                                className="bg-blue-600 hover:bg-blue-700 text-white mt-4 p-2 rounded-md"
                            >
                                Select Interested Events
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center flex flex-col gap-3 items-center py-16">
                            <h2 className="text-3xl font-bold">Mohana Mantra Event Pass</h2>
                            <p>The pass price is ₹{ticketPrice}.</p>
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white mt-4 p-2 rounded-md"
                                onClick={handleRazorpayPayment}
                            >
                                Get Your Pass
                            </button>
                            {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyTicket;
