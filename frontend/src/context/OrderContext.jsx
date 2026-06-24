import { createContext, useContext, useState, useEffect } from 'react'

const OrderContext = createContext(null)

const INITIAL_STATE = {
  selectedPlant:    null,
  coolingQty:       1,
  normalQty:        0,
  deliveryDate:     '',
  deliveryTime:     'morning',
  deliveryAddress:  '',
  paymentMethod:    'cod',
  placedOrder:      null,
}

// Load state from localStorage on init
const getInitialState = () => {
  try {
    const saved = localStorage.getItem('wc_order_state')
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error('Error loading order state', e)
  }
  return INITIAL_STATE
}

// Generate a demo order when backend is not available
function makeDemoOrder(plant, coolingQty, normalQty, deliveryDate, deliveryTime, deliveryAddress, paymentMethod) {
  const total = coolingQty * (plant?.cooling_price || 30) + normalQty * (plant?.normal_price || 15)
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand    = Math.floor(1000 + Math.random() * 9000)
  return {
    _id:              `demo_${Date.now()}`,
    order_id:         `ORD-${dateStr}-${rand}`,
    user_id:          'demo_user_1',
    plant_id:         plant,
    cooling_cans:     coolingQty,
    normal_cans:      normalQty,
    cooling_price:    plant?.cooling_price || 30,
    normal_price:     plant?.normal_price  || 15,
    total_amount:     total,
    delivery_date:    deliveryDate || new Date().toISOString().slice(0, 10),
    delivery_time:    deliveryTime,
    delivery_address: deliveryAddress,
    payment_method:   paymentMethod,
    payment_status:   'pending',
    order_status:     'placed',
    whatsapp_sent:    false,
    customer_name:    'Demo User',
    customer_phone:   '9999999999',
    createdAt:        new Date().toISOString(),
  }
}

export const OrderProvider = ({ children }) => {
  const [order, setOrder] = useState(getInitialState)

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('wc_order_state', JSON.stringify(order))
    } catch (e) {
      console.error('Error saving order state', e)
    }
  }, [order])

  const setPlant           = (plant)   => setOrder((p) => ({ ...p, selectedPlant: plant }))
  const setCoolingQty      = (qty)     => setOrder((p) => ({ ...p, coolingQty: Math.max(0, qty) }))
  const setNormalQty       = (qty)     => setOrder((p) => ({ ...p, normalQty:  Math.max(0, qty) }))
  const setDeliveryDate    = (date)    => setOrder((p) => ({ ...p, deliveryDate: date }))
  const setDeliveryTime    = (time)    => setOrder((p) => ({ ...p, deliveryTime: time }))
  const setDeliveryAddress = (address) => setOrder((p) => ({ ...p, deliveryAddress: address }))
  const setPaymentMethod   = (method)  => setOrder((p) => ({ ...p, paymentMethod: method }))
  const setPlacedOrder     = (placedOrder) => setOrder((p) => ({ ...p, placedOrder }))
  const resetOrder         = () => setOrder(INITIAL_STATE)

  const createDemoOrder = () => {
    const demo = makeDemoOrder(
      order.selectedPlant, order.coolingQty, order.normalQty,
      order.deliveryDate, order.deliveryTime, order.deliveryAddress, order.paymentMethod
    )
    setPlacedOrder(demo)
    
    // Save to list of demo orders in localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('wc_demo_orders') || '[]')
      localStorage.setItem('wc_demo_orders', JSON.stringify([demo, ...existing]))
    } catch (e) {
      console.error('Error saving demo order list', e)
    }

    return demo
  }

  const totalAmount = order.selectedPlant
    ? (order.coolingQty * (order.selectedPlant.cooling_price || 30)) +
      (order.normalQty  * (order.selectedPlant.normal_price  || 15))
    : 0

  return (
    <OrderContext.Provider value={{
      ...order, totalAmount,
      setPlant, setCoolingQty, setNormalQty,
      setDeliveryDate, setDeliveryTime, setDeliveryAddress,
      setPaymentMethod, setPlacedOrder, resetOrder, createDemoOrder,
    }}>
      {children}
    </OrderContext.Provider>
  )
}

export const useOrder = () => {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrder must be used inside OrderProvider')
  return ctx
}
