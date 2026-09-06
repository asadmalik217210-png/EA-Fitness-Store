import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';
import { ToastStack } from '../common/States';
import { useUI } from '../../context/UIContext';
import { PageFade } from '../common/Motion';

export default function StoreLayout() {
  const { toasts } = useUI();
  const location = useLocation();
  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <PageFade key={location.pathname}>
          <Outlet />
        </PageFade>
      </AnimatePresence>
      <Footer />
      <CartDrawer />
      <ToastStack toasts={toasts} />
    </>
  );
}
