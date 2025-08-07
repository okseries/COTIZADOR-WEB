
import { Card } from '@/components/ui/card'
import React from 'react'

const PlansItem = () => {
  return (
    <Card className="w-full h-full flex flex-col justify-center items-center">
      <h2 className="text-lg font-bold">Plan Name</h2>
      <p className="text-sm text-gray-500">Plan Description</p>
    </Card>
  )
}

export default PlansItem
