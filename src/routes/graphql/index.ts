import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql } from 'graphql';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {


      
    },
  });
};

  


const MemberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: { value: 'BASIC' },
    BUSINESS: { value: 'BUSINESS' },
  },
});


const MemberType = new GraphQLObjectType({
  name: 'memberType',
  fields: {
    id: { type: MemberTypeId },
    discount: { type: GraphQLString },
    postsLimitPerMonth: { type: GraphQLString },
  },
});

const Post = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: UUIDType},
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    author: {
      type: User,
      resolve: (post, _, { prisma }) => prisma.user.findUnique({ where: { id: post.authorId } }),
    },
  }),
});



const CreatePost = new GraphQLObjectType({
  name: 'CreatePost',
  fields: () => ({
    id: { type: UUIDType},
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: UUIDType},
  }),
});


const Profile = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: UUIDType },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    memberType: {
      type: MemberType,
      resolve: (profile, _, { prisma }) => prisma.memberType.findUnique({ where: { id: profile.memberTypeId } }),
    },
    user: {
      type: User,
      resolve: (profile, _, { prisma }) => prisma.user.findUnique({ where: { id: profile.userId } }),
    },
  }),
});

const CreteProfile = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: UUIDType },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    memberType: {
      type: MemberType,
      resolve: (profile, _, { prisma }) => prisma.memberType.findUnique({ where: { id: profile.memberTypeId } }),
    },
  }),
});




const User = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType)  },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: {
      type: Profile,
      resolve: (user, _, { prisma }) => prisma.profile.findUnique({ where: { userId: user.id } }),
    },
    posts: {
      type: new GraphQLList(Post),
      resolve: (user, _, { prisma }) => prisma.post.findMany({ where: { authorId: user.id } }),
    },
    userSubscribedTo: {
      type: new GraphQLList(User),
      resolve: (user, _, { prisma }) => prisma.user.findMany({
        where: {
          subscribedToUser: {
            some: { subscriberId: user.id }
          }
        }
      }),
    },
    subscribedToUser: {
      type: new GraphQLList(User),
      resolve: (user, _, { prisma }) => prisma.user.findMany({
        where: {
          userSubscribedTo: {
            some: { authorId: user.id }
          }
        }
      }),
    },
  }),
});

 


const CreateUser = new GraphQLObjectType({
  name: 'CeateUser',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType)  },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
      
  
  }),
});



const schema2 = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      memberTypes: {
         type: new GraphQLList(MemberType),
         resolve: async (parent, args, { prisma }) => {
          return prisma.memberType.findMany();
        },
      },
          users: {
         type: new GraphQLList(User),
         resolve: async (parent, args, { prisma }) => {
          return prisma.User.findMany();
        },
      },
          posts: {
         type: new GraphQLList(Post),
         resolve: async (parent, args, { prisma }) => {
          return prisma.Post.findMany();
        },
      },
          profiles: {
         type: new GraphQLList(Profile),
         resolve: async (parent, args, { prisma }) => {
          return prisma.Profile.findMany();
        },
      },


      memberType: {
         type: MemberType,
          args: {
          id: { type: MemberTypeId},
        },
        resolve: async (parent, { id }, { prisma }) => {
          return prisma.memberType.findUnique({ where: { id } })
      }
      },

          user: {
         type: User,
          args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (parent, { id }, { prisma }) => {
          return prisma.User.findUnique({ where: { id } })
      }
      },

              post: {
         type: Post,
          args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (parent, { id }, { prisma }) => {
          return prisma.Post.findUnique({ where: { id } })
      }
      },

      
              profile: {
         type: Profile,
          args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (parent, { id }, { prisma }) => {
          return prisma.Profile.findUnique({ where: { id } })
      }
      },




      
    }
  }),
  mutation:  new GraphQLObjectType({
   name: 'Mutation',
  fields: {
    createPost: {
      type: Post,
      args: {
        input: {
          type: new GraphQLInputObjectType({
            name: 'CreatePostInput', 
            fields: {
              title: { type: new GraphQLNonNull(GraphQLString) },
              content: { type: new GraphQLNonNull(GraphQLString) },
              authorId: { type: new GraphQLNonNull(UUIDType) }
            }
          })
        }
      },
      resolve: async (parent, { input }, { prisma }) => {
      
        const authorExists = await prisma.user.findUnique({
          where: { id: input.authorId }
        });

        if (!authorExists) {
          throw new Error(`User with id ${input.id} not found`);
        }

 

          return await prisma.post.create({
            data: {
              title: input.title,
              content: input.content,
              authorId: input.authorId
            }
          });
    

        }
      }
    
  ,




         createUser: {
          type: User, 
                args: {
                  input: {
                    type: new GraphQLInputObjectType({
                      name: 'CreateUserInput',
                      fields: {
          name: { type:new  GraphQLNonNull(GraphQLString) },
          balance: { type: new GraphQLNonNull(GraphQLFloat)},
        
                      }
                    })
                  }
                } 
             
        
         
    
 
        ,
           resolve: async (parent, {input}, { prisma }) => {
          return prisma.user.create({
            data:{
               name: input.name,
               balance: input.balance,
  
            }
          })
      }

       },
        createProfile: {
                    type: Profile, 
                args: {
                  input: {
                    type: new GraphQLInputObjectType({
                      name: 'CreateProfileInput',
                      fields: {
         
  isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
 memberTypeId:  { type: new GraphQLNonNull(MemberTypeId) },
 userId:  {   type: new GraphQLNonNull(UUIDType),},
  
                      }
                    })
                  }
                } 
        ,
           resolve: async (parent, {input}, { prisma }) => {

            if(!Number.isInteger(input.yearOfBirth)){
              console.log(`Int cannot represent non-integer value: ${input.yearOfBirth}`)
              return {
        errors: [{
          message: `Int cannot represent non-integer value: ${input.yearOfBirth}`,
 
        }]
               
            }}


try {
       return prisma.profile.create({
            data:{
              id: input.userId,
                  userId: input.userId,
             memberTypeId:input.memberTypeId,
             isMale:input.isMale, 
             yearOfBirth: input.yearOfBirth
  
            }
          })
} catch (error) {
   return {
        errors: [{
          message: 'Failed to create profile: database error',
        }]
      };
}


    
      }
       },


    },
  })


});

export default plugin;
