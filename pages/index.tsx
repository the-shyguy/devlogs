import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import Header from '../components/Header'
import { sanityClient, urlFor } from '../sanity'
import { Post } from '../typings'

interface Props {
  posts: [Post]
}

const Home = ({ posts }: Props) => {
  return (
    <div className="mx-auto max-w-7xl">
      <Head>
        <title>Devlogs</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <div className="flex items-center justify-between border-y border-black bg-green-500 py-10 lg:py-0">
        <div className="space-y-5 px-10">
          <h1 className="max-w-xl font-serif text-6xl">
            <span className="italic">Devlogs</span> is a place to write and
            connect for devs.
          </h1>
          <h2>
            Post your thinking on any topic, share ideas or get inspired from
            others.
          </h2>
        </div>
        <img
          className="hidden h-32 space-y-5 px-10 md:inline-flex lg:h-64"
          src="https://miro.medium.com/max/1400/1*psYl0y9DUzZWtHzFJLIvTw.png"
          alt=""
        />
      </div>

      <div className="grid grid-cols-1 gap-3 p-2 sm:grid-cols-2 md:gap-6 md:p-4 lg:grid-cols-3 lg:p-6">
        {posts.map((post) => (
          <Link key={post._id} href={`/post/${post.slug.current}`}>
            <div className="group relative cursor-pointer overflow-hidden rounded-lg border">
              <div className="h-80 w-full object-cover transition-transform duration-200 ease-in-out group-hover:scale-105">
                <Image
                  src={urlFor(post.mainImage).url()!}
                  alt={post.title}
                  width={100}
                  height={60}
                  layout="responsive"
                  priority
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-between bg-white p-5">
                <div>
                  <p className="text-lg font-semibold">{post.title}</p>
                  <p className="text-x">
                    {post.description}{' '}
                    <span className="text-gray-500">
                      {' '}
                      by {post.author.name}
                    </span>
                  </p>
                </div>
                <div className="h-12 w-12">
                  <Image
                    className=" rounded-full"
                    src={urlFor(post.author.image).url()!}
                    alt={post.author.name}
                    height="100%"
                    width="100%"
                    layout="intrinsic"
                  />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Home

export const getServerSideProps = async () => {
  const query = `*[_type == "post"] {
    _id,
    title,
    author ->{
    name,
    image
    },
    description,
    mainImage,
    slug
  }`

  const posts = await sanityClient.fetch(query)

  return {
    props: {
      posts,
    },
  }
}
