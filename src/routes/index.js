const PageNotFound = () => import(/* webpackChunkName: "group-default" */ '@/pages/PageNotFound.vue')
const Main = () => import(/* webpackChunkName: "group-default" */ '@/pages/Main.vue')
const Product = () => import(/* webpackChunkName: "group-default" */ '@/pages/Product.vue')
const Company = () => import(/* webpackChunkName: "group-default" */ '@/pages/Company.vue')
const Support = () => import(/* webpackChunkName: "group-default" */ '@/pages/Support.vue')
const Location = () => import(/* webpackChunkName: "group-default" */ '@/pages/Location.vue')
const routes = [
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  },
  {
    name: '404',
    path: '/404',
    component: PageNotFound,
  },
  {
    name: 'main',
    path: '/',
    component: Main
  },
  {
    name: 'product',
    path: '/product',
    component: Product,
    props: true,
    children: [
      {
        name: 'product-section',
        path: ':sec',
        component: Product,
        children: [
          {
            name: 'product-select',
            path: ':code',
            component: Product
          }
        ]
      }
    ]
  },
  {
    name: 'company',
    path: '/company',
    component: Company
  },
  {
    name: 'support',
    path: '/support',
    component: Support,
    props: true,
    children: [
      {
        name: 'support-section',
        path: ':sec',
        component: Support
      }
    ]
  },
  {
    name: 'location',
    path: '/location',
    component: Location
  }
]

export default routes