import React from "react";
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
/* eslint-enable no-unused-vars */
import {
  Search,
  Calendar,
  ShoppingCart,
  Truck,
  Smile,
  ShieldCheck,
  RefreshCcw,
  CreditCard,
  PhoneCall,
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    icon: <Search size={28} />,
    title: "Browse Products",
    description:
      "Explore our wide range of premium furniture and appliances curated for modern living."
  },
  {
    icon: <Calendar size={28} />,
    title: "Select Tenure",
    description:
      "Choose flexible rental durations from short-term to long-term plans."
  },
  {
    icon: <ShoppingCart size={28} />,
    title: "Add to Cart",
    description:
      "Add your favorite products to cart with a seamless one-click process."
  },
  {
    icon: <Truck size={28} />,
    title: "Choose Delivery Date",
    description:
      "Schedule delivery as per your convenience with doorstep setup."
  },
  {
    icon: <Smile size={28} />,
    title: "Enjoy Rental",
    description:
      "Relax and experience hassle-free renting with full support."
  }
];

const features = [
  {
    icon: <ShieldCheck size={30} />,
    title: "Quality Assured",
    description:
      "All products undergo strict quality checks before delivery."
  },
  {
    icon: <RefreshCcw size={30} />,
    title: "Easy Replacement",
    description:
      "Facing an issue? Get quick replacements without hidden charges."
  },
  {
    icon: <CreditCard size={30} />,
    title: "Flexible Payments",
    description:
      "Multiple payment options including UPI, cards and net banking."
  },
  {
    icon: <PhoneCall size={30} />,
    title: "24/7 Support",
    description:
      "Dedicated customer support team available anytime you need help."
  }
];

const testimonials = [
  {
    name: "Rahul Sharma",
    feedback:
      "Amazing rental experience! Delivery was smooth and product quality exceeded expectations."
  },
  {
    name: "Priya Das",
    feedback:
      "Super affordable and convenient. Perfect for students and working professionals."
  },
  {
    name: "Aman Verma",
    feedback:
      "Customer support is very responsive. Highly recommend RentEase!"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } }
};

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-6 md:px-20 py-16 bg-linear-to-b from-white to-purple-50">

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mt-7">
          How RentEase Works
        </h1>
        <p className="text-[#560BAD] font-medium mt-4 text-lg">
          Renting furniture & appliances made effortless
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      >
        {steps.map((step, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover={{ scale: 1.07 }}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-2xl transition duration-300 text-center border border-purple-100"
          >
            <motion.div
              whileHover={{ rotate: 15 }}
              className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-[#560BAD] text-white"
            >
              {step.icon}
            </motion.div>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {step.title}
            </h3>

            <p className="text-sm text-gray-500">
              {step.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        className="mt-24 text-center"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-12">
          Why Choose RentEase?
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-purple-100"
            >
              <div className="mb-4 text-[#560BAD] flex justify-center">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        className="mt-28 text-center"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-12">
          What Our Customers Say
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-2xl shadow-md border border-purple-100"
            >
              <div className="flex justify-center mb-4 text-yellow-400">
                <Star size={20} />
                <Star size={20} />
                <Star size={20} />
                <Star size={20} />
                <Star size={20} />
              </div>
              <p className="text-gray-600 text-sm mb-4">
                "{item.feedback}"
              </p>
              <h4 className="font-semibold text-gray-800">
                {item.name}
              </h4>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mt-32 text-center bg-[#560BAD] text-white py-16 rounded-3xl shadow-2xl"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Transform Your Space?
        </h2>
        <p className="mb-8 text-purple-100">
          Browse our premium rental collection and get started today.
        </p>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/products")}
          className="px-10 py-4 bg-white text-[#560BAD] font-semibold rounded-xl shadow-lg hover:bg-purple-100 transition"
        >
          Browse Products
        </motion.button>
      </motion.div>

    </div>
  );
};

export default HowItWorks;