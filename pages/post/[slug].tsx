import { GetStaticProps } from 'next'
import Image from 'next/image'
import React, { useState } from 'react'
import Header from '../../components/Header'
import { sanityClient, urlFor } from '../../sanity'
import { Post } from '../../typings'
import PortableText from 'react-portable-text'
import { useForm, SubmitHandler } from 'react-hook-form'
import Head from 'next/head'

interface IFormInput {
  _id: string
  name: string
  email: string
  comment: string
}

interface Props {
  post: Post
}

const Post = ({ post }: Props) => {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>()

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    fetch('/api/createComment', {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then(() => {
        console.log(data)
        setSubmitted(true)
      })
      .catch((err) => {
        console.log(err)
        setSubmitted(false)
      })
  }

  return (
    <main>
      <Head>
        <title>Devlogs - {post.title}</title>
      </Head>
      <Header />

      <Image
        src={urlFor(post.mainImage).url()}
        width="100%"
        height={15}
        objectFit="cover"
        layout="responsive"
      ></Image>
      <article className=" mx-auto max-w-3xl p-5">
        <h1 className="mt-10 mb-3 text-3xl">{post.title}</h1>
        <h2 className="mb-2 text-xl font-light text-gray-500">
          {post.description}
        </h2>
        <div className="flex items-center">
          <Image
            className="rounded-full"
            src={urlFor(post.author.image).url()}
            width={40}
            height={40}
            layout="intrinsic"
          ></Image>
          <p className="pl-2 text-sm font-extralight">
            Blog post by{' '}
            <span className="text-blue-600">{post.author.name}</span> -
            Published at {new Date(post._createdAt).toLocaleString()}
          </p>
        </div>
        <div className="mt-8">
          <PortableText
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
            content={post.body}
            serializers={{
              h1: (props: any) => (
                <h1 className="my-5 text-2xl font-bold" {...props} />
              ),
              h2: (props: any) => (
                <h2 className="my-5 text-xl font-semibold" {...props} />
              ),
              li: ({ children }: any) => (
                <li className="ml-4 list-disc">{children}</li>
              ),
              link: ({ href, children }: any) => (
                <a href={href} className="text-blue-600 hover:underline">
                  {children}
                </a>
              ),
            }}
          />
        </div>
      </article>

      <hr className=" my-5 mx-auto max-w-lg border-blue-500" />
      {submitted ? (
        <div className="my-10 mx-auto flex max-w-2xl flex-col bg-blue-500 p-10 text-white">
          <h3 className="text-2xl font-semibold">
            Thank you for submitting your comment
          </h3>
          <p>Once it has been approved, it will appear below!</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto mb-10 flex max-w-2xl flex-col p-5"
        >
          <h3 className="text-sm text-blue-600">Enjoyed this article</h3>
          <h4 className="text-xl font-semibold">Leave a comment below!</h4>

          <input
            {...register('_id')}
            type="hidden"
            name="_id"
            value={post._id}
          />

          <hr className="mt-2 py-3" />
          <label className="mb-5 block">
            <span className="text-gray-700">Name</span>
            <input
              {...register('name', { required: true })}
              className="form-input mt-1 block w-full rounded border py-2 px-3 shadow"
              placeholder="Name"
              type="text"
            />
          </label>
          <label className="mb-5 block">
            <span className="text-gray-700">Email</span>
            <input
              {...register('email', { required: true })}
              className="form-input mt-1 block w-full rounded border py-2 px-3 shadow"
              placeholder="Email"
              type="text"
            />
          </label>
          <label className="mb-5 block">
            <span className="text-gray-700">Comment</span>
            <textarea
              {...register('comment', { required: true })}
              className="form-textarea mt-1 block w-full rounded border py-2 px-3 shadow"
              placeholder="Comment..."
              rows={8}
            />
          </label>
          <div className="flex flex-col">
            {errors.name && (
              <span className="text-red-500">The Name Field is required</span>
            )}
            {errors.email && (
              <span className="text-red-500">The Email Field is required</span>
            )}
            {errors.comment && (
              <span className="mb-5 text-red-500">
                The Comment Field is required
              </span>
            )}
          </div>
          <input
            className="cursor-pointer rounded bg-blue-500 py-2 text-white shadow transition-all duration-200 hover:bg-blue-600"
            type="submit"
          />
        </form>
      )}

      <div className="my-5 mx-auto flex max-w-2xl flex-col space-y-2 p-10 shadow shadow-blue-400">
        <h3 className="text-2xl font-semibold">Comments</h3>
        <hr className="pb-2" />

        {post.comments.map((comment) => (
          <div key={comment._id} className="flex justify-between">
            <p className="">
              <span className="text-blue-500">{comment.name}:</span>{' '}
              {comment.comment}
            </p>
            <p className="text-sm text-gray-400">
              {new Date(comment._createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}

export default Post

export const getStaticPaths = async () => {
  const query = `*[_type == "post"] {
        _id,
        slug {
        current
        }
      }`
  const posts = await sanityClient.fetch(query)

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }))

  return {
    paths,
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type == "post" && slug.current == $slug][0] {
    _id,
    _createdAt,
      title,
      author ->{
      name,
      image
      },
    'comments': * [
    _type == "comment" &&
    post._ref == ^._id &&
    Approved == true],
      description,
      mainImage,
      slug,
      body
  }`

  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  })

  if (!post) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      post,
    },
    revalidate: 60,
  }
}
