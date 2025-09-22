import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const FAQ = () => {
  const { t } = useTranslation()
  const [openIndex, setOpenIndex] = useState(null)

  const faqData = [
    {
      question: t('faq.items.whatIsYesCoin.question'),
      answer: t('faq.items.whatIsYesCoin.answer')
    },
    {
      question: t('faq.items.howToBuy.question'),
      answer: t('faq.items.howToBuy.answer')
    },
    {
      question: t('faq.items.nftUtility.question'),
      answer: t('faq.items.nftUtility.answer')
    },
    {
      question: t('faq.items.tokenomics.question'),
      answer: t('faq.items.tokenomics.answer')
    },
    {
      question: t('faq.items.governance.question'),
      answer: t('faq.items.governance.answer')
    },
    {
      question: t('faq.items.security.question'),
      answer: t('faq.items.security.answer')
    },
    {
      question: t('faq.items.support.question'),
      answer: t('faq.items.support.answer')
    },
    {
      question: t('faq.items.roadmap.question'),
      answer: t('faq.items.roadmap.answer')
    }
  ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="font-press text-2xl text-brown mb-4">
          {t('faq.title')}
        </h1>
        <p className="font-pixel text-brown/80 max-w-3xl mx-auto leading-relaxed">
          {t('faq.subtitle')}
        </p>
      </motion.div>

      <div className="space-y-4">
        {faqData.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: 0.1 * index,
              type: "spring",
              stiffness: 100
            }}
            className="pixel-faq-item"
          >
            <motion.button 
              onClick={() => toggleFAQ(index)}
              className="pixel-faq-header"
              whileHover={{ 
                scale: 1.02,
                boxShadow: '3px 3px 0px #2D2520'
              }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <h3 className="font-pixel text-brown pr-4">
                {faq.question}
              </h3>
              <motion.div
                animate={{ 
                  rotate: openIndex === index ? 45 : 0,
                  scale: openIndex === index ? 1.1 : 1
                }}
                transition={{ 
                  duration: 0.3,
                  type: "spring",
                  stiffness: 200
                }}
                className="flex-shrink-0"
              >
                {openIndex === index ? (
                  <Minus className="w-5 h-5 text-magenta" />
                ) : (
                  <Plus className="w-5 h-5 text-gold" />
                )}
              </motion.div>
            </motion.button>
            
            <AnimatePresence mode="wait">
              {openIndex === index && (
                <motion.div
                  initial={{ 
                    height: 0, 
                    opacity: 0,
                    y: -10
                  }}
                  animate={{ 
                    height: "auto", 
                    opacity: 1,
                    y: 0
                  }}
                  exit={{ 
                    height: 0, 
                    opacity: 0,
                    y: -10
                  }}
                  transition={{ 
                    duration: 0.4, 
                    ease: [0.04, 0.62, 0.23, 0.98],
                    opacity: { duration: 0.3 }
                  }}
                  className="overflow-hidden pixel-faq-content"
                >
                  <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 10, opacity: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: 0.1,
                      ease: "easeOut"
                    }}
                    className="p-4"
                  >
                    <p className="font-pixel text-sm text-brown/90 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default FAQ
