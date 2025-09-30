
import Sobre from '../components/Sobre/Sobre'
import SobreCard from '../components/SobreCard'
import { motion } from 'framer-motion'
import CtaFinal from '../components/CTA'
import PageTitle from '../context/PageTitle';

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

const About = () => {
  return (
    <div id='#inicio' className=''>
      <PageTitle title={"Sobre | Sublime Perfumes Fracionados"}/>
      <div className='px-3 sm:px-[5vw] md:px-[2vw] lg:px-[9vw]'>
        
        {/* Animação do bloco principal */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Sobre />
        </motion.div>

        {/* Cards entrando com leve atraso */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <SobreCard />
        </motion.div>

        {/* CTA */}
        <motion.section
          className='sec-2 justify-self-center justify-center place-self-center justify-items-center place-items-center pt-4'
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <CtaFinal/>
        </motion.section>

      </div>
    </div>
  )
}

export default About
