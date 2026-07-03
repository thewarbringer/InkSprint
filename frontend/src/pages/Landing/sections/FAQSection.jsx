import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeading from "../../../components/common/SectionHeading.jsx";
import { FAQS } from "../../../constants/landingContent.js";

function FAQItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-white/[0.08] bg-white/[0.05]">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between px-5 py-[18px] text-left text-[15px] font-semibold text-white"
      >
        {q}
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
          className="ml-4 flex-shrink-0 text-[18px] font-normal text-secondary"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="px-5"
          >
            <p className="pb-[18px] text-[14.5px] leading-relaxed text-muted">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="px-8 py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading eyebrow="Questions" title="Before you sprint" />

        <div className="mx-auto flex max-w-[760px] flex-col gap-2.5">
          {FAQS.map((faq, i) => (
            <FAQItem
              key={faq.q}
              q={faq.q}
              a={faq.a}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
