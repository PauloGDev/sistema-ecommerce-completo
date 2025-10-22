import { motion } from 'framer-motion'
import Hero from '../components/Hero'
import SecaoSobre from '../components/SecaoSobre'
import TitleB from '../components/TitleB'
import GridProdutos from '../components/GridProdutos'
import CtaFinal from '../components/CTA'
import PageTitle from '../context/PageTitle'
import CarrosselCategoria from '../components/CarrosselCategoria'
import ProdutosDestaque from '../components/Produtos/ProdutosDestaque'

const Home = () => {
  // Variantes de animação para reutilizar
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };
  
  return (
    <div id='inicio'>
      <PageTitle title={"Sublime | Perfumes Fracionados"}/>
      <Hero/>
      <div className="px-3 sm:px-6 lg:px-12 max-w-7xl mx-auto">

         {/* Produtos */}
        <motion.section
          id="projetos"
          className="sec-1 justify-center place-self-center justify-items-center place-items-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <TitleB 
            link={'https://wa.me/5585984642900'} 
            text1={"Nossos Perfumes"} 
            text2={"Explore vários aromas."} 
            text3={"Fale Conosco"}
          />
          <GridProdutos/>
        </motion.section>

        {/* Produtos por Categoria */}
        <motion.section
          id="projetos"
          className="sec-1 justify-center place-self-center justify-items-center place-items-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <CarrosselCategoria categoria="Masculinos" title="Masculinos em destaque" />
          <CarrosselCategoria categoria="Femininos" title="Femininos em destaque" />
          <CarrosselCategoria categoria="Árabes" title="Árabes em destaque" />
        </motion.section>

      </div>
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
  )
}

export default Home
