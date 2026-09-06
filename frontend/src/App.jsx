import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './site.css';
import './product-responsive.css';
import StoreLayout from './components/layout/StoreLayout';
import Home from './pages/Home/Home';
import Shop from './pages/Shop/Shop';
import Product from './pages/Product/Product';
import { Login, Signup } from './pages/Auth/Auth';
import { ForgotPassword, ResetPassword } from './pages/Auth/Password';
import CartPage from './pages/Cart/CartPage';
import Checkout from './pages/Checkout/Checkout';
import { OrderConfirmation, Orders, OrderDetails, TrackOrder } from './pages/Orders/Orders';
import Wishlist from './pages/Wishlist/Wishlist';
import Account from './pages/Account/Account';
import About from './pages/About/About';
import { Contact, FAQ, SizeGuide, Shipping, Returns, Privacy, Terms, NotFound, Maintenance } from './pages/Content/Content';
import {
  AdminLayout, AdminOverview, AdminProducts, AdminProductForm, AdminInventory, AdminOrders, AdminOrderDetail,
  AdminCustomers, AdminCustomerDetail, AdminReviews, AdminCoupons, AdminPayments, AdminSimple, AdminUsers,
  AdminSettings, AdminCategories, AdminReturns, AdminShipping,
} from './pages/Admin/Admin';
import { RequireAuth } from './routes/guards';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<StoreLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/men" element={<Shop title="Men" preset={{ gender: 'men' }} />} />
          <Route path="/women" element={<Shop title="Women" preset={{ gender: 'women' }} />} />
          <Route path="/new-arrivals" element={<Shop title="New arrivals" preset={{ new: 'true' }} />} />
          <Route path="/best-sellers" element={<Shop title="Best sellers" preset={{ bestseller: 'true' }} />} />
          <Route path="/sale" element={<Shop title="Sale" preset={{ sale: 'true' }} />} />
          <Route path="/product/:slug" element={<Product />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/size-guide" element={<SizeGuide />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route element={<RequireAuth />}>
            <Route path="/account" element={<Account />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id" element={<AdminProductForm />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="customers/:id" element={<AdminCustomerDetail />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="shipping" element={<AdminShipping />} />
          <Route path="returns" element={<AdminReturns />} />
          <Route path="analytics" element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
