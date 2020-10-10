import React from 'react'
import { graphql } from 'gatsby'
import Layout from '../components/layout'
import SEO from '../components/seo'

const IndexPage = ({ data, location }) => {
  return (
    <Layout location={location}>
      <SEO title="Feed" />
      <section className="container">
        <h1 className="text-center">Projects</h1>
      </section>
    </Layout>
  )
}

export const query = graphql`
  query {
    illustration: file(relativePath: { eq: "hero.png" }) {
      childImageSharp {
        fluid(maxWidth: 800) {
          ...GatsbyImageSharpFluid
        }
      }
    }
  }
`

export default IndexPage