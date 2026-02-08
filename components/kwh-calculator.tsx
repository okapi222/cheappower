"use client"

import { AlertDialogAction } from "@/components/ui/alert-dialog"

import { AlertDialogCancel } from "@/components/ui/alert-dialog"

import { AlertDialogFooter } from "@/components/ui/alert-dialog"

import { AlertDialogDescription } from "@/components/ui/alert-dialog"

import { AlertDialogTitle } from "@/components/ui/alert-dialog"

import { AlertDialogHeader } from "@/components/ui/alert-dialog"

import { AlertDialogContent } from "@/components/ui/alert-dialog"

import { AlertDialog } from "@/components/ui/alert-dialog"

import { useState, useEffect } from "react"
import { motion, LayoutGroup } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, X, ChevronDown, ChevronUp, Zap, Shuffle, FileText, ArrowUp, ArrowDown, ChevronRight, Search, Plus, Pin, TrendingUp, Info, RefreshCw, Undo2, Sun, Sunrise, Filter } from "lucide-react"
import { analyzeRegionPricing, askFollowUp, generateFactorAnalyses } from "@/app/actions"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface RegionData {
  priceUSD: number
  currency: string
  localPrice: number
  energyMix: {
    solar?: number
    wind?: number
    hydro?: number
    nuclear?: number
    naturalGas?: number
    coal?: number
    oil?: number
    other?: number
  }
  priceSource: string
  priceSourceUrl: string
  energySource: string
  energySourceUrl: string
}

interface ScoreRow {
  factor: string
  scores: Record<string, number>
  justifications: Record<string, string>
}

interface FactorAnalysis {
  factor: string
  analysis: string
  sources: { url: string; label: string }[]
}

interface AnalysisData {
  scoreTable: ScoreRow[]
  factorAnalyses: FactorAnalysis[]
  synthesis: string
  synthesisSources: { url: string; label: string }[]
  eiaSources?: { name: string; url: string }[]
}

const regionData: Record<string, RegionData> = {
  alabama: {
    priceUSD: 0.119,
    currency: "USD",
    localPrice: 0.119,
    energyMix: { naturalGas: 50, nuclear: 31, coal: 15, hydro: 2, solar: 1, other: 1 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/alabama/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/alabama/",
  },
  alaska: {
    priceUSD: 0.2073,
    currency: "USD",
    localPrice: 0.2073,
    energyMix: { naturalGas: 47, hydro: 24, oil: 13, coal: 9, wind: 4, solar: 1, other: 2 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/alaska/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/alaska/",
  },
  arizona: {
    priceUSD: 0.1219,
    currency: "USD",
    localPrice: 0.1219,
    energyMix: { naturalGas: 48, nuclear: 28, solar: 9, coal: 9, wind: 2, hydro: 2, other: 2 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/arizona/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/arizona/",
  },
  arkansas: {
    priceUSD: 0.0991,
    currency: "USD",
    localPrice: 0.0991,
    energyMix: { coal: 38, naturalGas: 23, nuclear: 21, hydro: 8, wind: 5, solar: 2, other: 3 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/arkansas/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/arkansas/",
  },
  california: {
    priceUSD: 0.2704,
    currency: "USD",
    localPrice: 0.2704,
    energyMix: { naturalGas: 40, solar: 23, hydro: 14, nuclear: 9, wind: 7, geothermal: 5, other: 2 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/california/",
    energySource: "CA Energy Commission 2024",
    energySourceUrl: "https://www.energy.ca.gov/data-reports/energy-almanac/california-electricity-data/2024-total-system-electric-generation",
  },
  colorado: {
    priceUSD: 0.1175,
    currency: "USD",
    localPrice: 0.1175,
    energyMix: { naturalGas: 30, wind: 30, coal: 28, solar: 8, hydro: 2, other: 2 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/colorado/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/colorado/",
  },
  connecticut: {
    priceUSD: 0.2437,
    currency: "USD",
    localPrice: 0.2437,
    energyMix: { naturalGas: 61, nuclear: 34, solar: 2, hydro: 1, other: 2 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/connecticut/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/connecticut/",
  },
  delaware: {
    priceUSD: 0.1285,
    currency: "USD",
    localPrice: 0.1285,
    energyMix: { naturalGas: 91, solar: 4, wind: 2, other: 3 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/delaware/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/delaware/",
  },
  florida: {
    priceUSD: 0.1353,
    currency: "USD",
    localPrice: 0.1353,
    energyMix: { naturalGas: 75, nuclear: 11, solar: 7, coal: 3, other: 4 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/florida/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/florida/",
  },
  georgia: {
    priceUSD: 0.1106,
    currency: "USD",
    localPrice: 0.1106,
    energyMix: { naturalGas: 41, nuclear: 34, coal: 13, solar: 7, hydro: 3, other: 2 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/georgia/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/georgia/",
  },
  hawaii: {
    priceUSD: 0.38,
    currency: "USD",
    localPrice: 0.38,
    energyMix: { oil: 66, solar: 22, wind: 8, other: 4 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/hawaii/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/hawaii/",
  },
  idaho: {
    priceUSD: 0.0951,
    currency: "USD",
    localPrice: 0.0951,
    energyMix: { hydro: 38, naturalGas: 19, wind: 10, solar: 6, other: 27 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/idaho/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/idaho/",
  },
  illinois: {
    priceUSD: 0.1221,
    currency: "USD",
    localPrice: 0.1221,
    energyMix: { nuclear: 54, naturalGas: 18, wind: 13, coal: 8, solar: 4, other: 3 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/illinois/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/illinois/",
  },
  indiana: {
    priceUSD: 0.1138,
    currency: "USD",
    localPrice: 0.1138,
    energyMix: { coal: 42, naturalGas: 30, wind: 11, nuclear: 8, solar: 5, other: 4 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/indiana/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/indiana/",
  },
  iowa: {
    priceUSD: 0.0942,
    currency: "USD",
    localPrice: 0.0942,
    energyMix: { wind: 63, coal: 21, naturalGas: 14, solar: 1, other: 1 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/iowa/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/iowa/",
  },
  kansas: {
    priceUSD: 0.108,
    currency: "USD",
    localPrice: 0.108,
    energyMix: { wind: 50, coal: 20, naturalGas: 15, nuclear: 10, solar: 3, other: 2 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/kansas/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/kansas/",
  },
  kentucky: {
    priceUSD: 0.0996,
    currency: "USD",
    localPrice: 0.0996,
    energyMix: { coal: 68, naturalGas: 18, hydro: 8, solar: 3, wind: 1, other: 2 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/kentucky/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/kentucky/",
  },
  louisiana: {
    priceUSD: 0.088,
    currency: "USD",
    localPrice: 0.088,
    energyMix: { naturalGas: 68, nuclear: 15, coal: 8, hydro: 4, solar: 3, other: 2 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/louisiana/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/louisiana/",
  },
  maine: {
    priceUSD: 0.2084,
    currency: "USD",
    localPrice: 0.2084,
    energyMix: { naturalGas: 33, hydro: 26, wind: 22, other: 19 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/maine/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/maine/",
  },
  maryland: {
    priceUSD: 0.1434,
    currency: "USD",
    localPrice: 0.1434,
    energyMix: { naturalGas: 40, nuclear: 35, coal: 10, wind: 5, solar: 5, hydro: 3, other: 2 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/maryland/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/maryland/",
  },
  massachusetts: {
    priceUSD: 0.2394,
    currency: "USD",
    localPrice: 0.2394,
    energyMix: { naturalGas: 75, solar: 11, hydro: 5, wind: 4, other: 5 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/massachusetts/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/massachusetts/",
  },
  michigan: {
    priceUSD: 0.1416,
    currency: "USD",
    localPrice: 0.1416,
    energyMix: { naturalGas: 36, coal: 26, nuclear: 22, wind: 8, solar: 3, hydro: 2, other: 3 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/michigan/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/michigan/",
  },
  minnesota: {
    priceUSD: 0.1221,
    currency: "USD",
    localPrice: 0.1221,
    energyMix: { wind: 28, nuclear: 24, coal: 22, naturalGas: 14, hydro: 6, solar: 3, other: 3 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/minnesota/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/minnesota/",
  },
  mississippi: {
    priceUSD: 0.1093,
    currency: "USD",
    localPrice: 0.1093,
    energyMix: { naturalGas: 76, nuclear: 13, coal: 5, solar: 2, other: 4 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/mississippi/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/mississippi/",
  },
  missouri: {
    priceUSD: 0.1106,
    currency: "USD",
    localPrice: 0.1106,
    energyMix: { coal: 58, nuclear: 16, naturalGas: 12, wind: 8, hydro: 3, solar: 1, other: 2 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/missouri/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/missouri/",
  },
  montana: {
    priceUSD: 0.0997,
    currency: "USD",
    localPrice: 0.0997,
    energyMix: { coal: 38, hydro: 35, wind: 18, naturalGas: 5, other: 4 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/montana/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/montana/",
  },
  nebraska: {
    priceUSD: 0.0914,
    currency: "USD",
    localPrice: 0.0914,
    energyMix: { coal: 43, wind: 33, nuclear: 16, naturalGas: 4, hydro: 3, solar: 1 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/nebraska/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/nebraska/",
  },
  nevada: {
    priceUSD: 0.1147,
    currency: "USD",
    localPrice: 0.1147,
    energyMix: { naturalGas: 60, solar: 20, hydro: 8, wind: 5, coal: 4, other: 3 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/nevada/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/nevada/",
  },
  "new hampshire": {
    priceUSD: 0.2107,
    currency: "USD",
    localPrice: 0.2107,
    energyMix: { nuclear: 50, naturalGas: 22, hydro: 10, wind: 8, solar: 4, other: 6 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/newhampshire/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/newhampshire/",
  },
  "new jersey": {
    priceUSD: 0.1629,
    currency: "USD",
    localPrice: 0.1629,
    energyMix: { naturalGas: 42, nuclear: 40, solar: 8, wind: 4, hydro: 2, other: 4 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/newjersey/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/newjersey/",
  },
  "new mexico": {
    priceUSD: 0.0918,
    currency: "USD",
    localPrice: 0.0918,
    energyMix: { wind: 40, naturalGas: 25, coal: 18, solar: 12, nuclear: 2, other: 3 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/newmexico/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/newmexico/",
  },
  "new york": {
    priceUSD: 0.1966,
    currency: "USD",
    localPrice: 0.1966,
    energyMix: { naturalGas: 39, nuclear: 17, hydro: 16, wind: 5, solar: 5, other: 18 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/newyork/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/newyork/",
  },
  "north carolina": {
    priceUSD: 0.096,
    currency: "USD",
    localPrice: 0.096,
    energyMix: { naturalGas: 35, nuclear: 32, coal: 15, solar: 9, hydro: 4, wind: 2, other: 3 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/northcarolina/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/northcarolina/",
  },
  "north dakota": {
    priceUSD: 0.0793,
    currency: "USD",
    localPrice: 0.0793,
    energyMix: { coal: 45, wind: 42, hydro: 7, naturalGas: 3, other: 3 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/northdakota/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/northdakota/",
  },
  ohio: {
    priceUSD: 0.1104,
    currency: "USD",
    localPrice: 0.1104,
    energyMix: { naturalGas: 59, nuclear: 16, coal: 12, wind: 6, solar: 4, other: 3 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/ohio/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/ohio/",
  },
  oklahoma: {
    priceUSD: 0.0909,
    currency: "USD",
    localPrice: 0.0909,
    energyMix: { naturalGas: 46, wind: 40, coal: 8, hydro: 3, solar: 1, other: 2 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/oklahoma/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/oklahoma/",
  },
  oregon: {
    priceUSD: 0.0926,
    currency: "USD",
    localPrice: 0.0926,
    energyMix: { hydro: 41, naturalGas: 28, wind: 15, solar: 6, coal: 5, other: 5 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/oregon/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/oregon/",
  },
  pennsylvania: {
    priceUSD: 0.1257,
    currency: "USD",
    localPrice: 0.1257,
    energyMix: { naturalGas: 58, nuclear: 30, coal: 6, wind: 2, hydro: 2, other: 2 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/pennsylvania/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/pennsylvania/",
  },
  "rhode island": {
    priceUSD: 0.2415,
    currency: "USD",
    localPrice: 0.2415,
    energyMix: { naturalGas: 89, wind: 4, solar: 3, hydro: 2, other: 2 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/rhodeisland/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/rhodeisland/",
  },
  "south carolina": {
    priceUSD: 0.109,
    currency: "USD",
    localPrice: 0.109,
    energyMix: { nuclear: 52, naturalGas: 26, coal: 10, hydro: 5, solar: 4, other: 3 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/southcarolina/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/southcarolina/",
  },
  "south dakota": {
    priceUSD: 0.1044,
    currency: "USD",
    localPrice: 0.1044,
    energyMix: { wind: 52, hydro: 32, naturalGas: 8, coal: 5, other: 3 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/southdakota/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/southdakota/",
  },
  tennessee: {
    priceUSD: 0.109,
    currency: "USD",
    localPrice: 0.109,
    energyMix: { nuclear: 42, naturalGas: 22, hydro: 18, coal: 12, wind: 2, solar: 2, other: 2 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/tennessee/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/tennessee/",
  },
  texas: {
    priceUSD: 0.0979,
    currency: "USD",
    localPrice: 0.0979,
    energyMix: { naturalGas: 51, wind: 22, coal: 12, solar: 8, nuclear: 7 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/texas/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/texas/",
  },
  utah: {
    priceUSD: 0.0997,
    currency: "USD",
    localPrice: 0.0997,
    energyMix: { coal: 48, naturalGas: 28, solar: 12, wind: 6, hydro: 3, other: 3 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/utah/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/utah/",
  },
  vermont: {
    priceUSD: 0.1699,
    currency: "USD",
    localPrice: 0.1699,
    energyMix: { hydro: 50, nuclear: 25, wind: 12, solar: 6, other: 7 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/vermont/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/vermont/",
  },
  virginia: {
    priceUSD: 0.1062,
    currency: "USD",
    localPrice: 0.1062,
    energyMix: { naturalGas: 52, nuclear: 30, coal: 5, hydro: 4, solar: 4, wind: 2, other: 3 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/virginia/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/virginia/",
  },
  washington: {
    priceUSD: 0.0905,
    currency: "USD",
    localPrice: 0.0905,
    energyMix: { hydro: 61, naturalGas: 17, nuclear: 10, wind: 8, other: 4 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/washington/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/washington/",
  },
  "west virginia": {
    priceUSD: 0.1105,
    currency: "USD",
    localPrice: 0.1105,
    energyMix: { coal: 88, hydro: 5, wind: 4, naturalGas: 2, other: 1 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/westvirginia/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/westvirginia/",
  },
  wisconsin: {
    priceUSD: 0.1272,
    currency: "USD",
    localPrice: 0.1272,
    energyMix: { naturalGas: 38, coal: 28, nuclear: 18, wind: 8, hydro: 4, solar: 2, other: 2 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/wisconsin/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/wisconsin/",
  },
  wyoming: {
    priceUSD: 0.0914,
    currency: "USD",
    localPrice: 0.0914,
    energyMix: { coal: 68, wind: 22, naturalGas: 5, hydro: 3, other: 2 },
    priceSource: "EIA 2024",
    priceSourceUrl: "https://www.eia.gov/electricity/state/wyoming/",
    energySource: "EIA 2024",
    energySourceUrl: "https://www.eia.gov/electricity/state/wyoming/",
  },
}

const energyColors: Record<string, string> = {
  solar: "#facc15",
  wind: "#6ee7b7",
  hydro: "#22c55e",
  nuclear: "#a855f7",
  naturalGas: "#f97316",
  coal: "#6b7280",
  oil: "#1f2937",
  geothermal: "#ef4444",
  other: "#3b82f6",
}

const energyLabels: Record<string, string> = {
  solar: "Solar",
  wind: "Wind",
  hydro: "Hydro",
  nuclear: "Nuclear",
  naturalGas: "Nat. Gas",
  coal: "Coal",
  oil: "Oil",
  geothermal: "Geothermal",
  other: "Other",
}

const getRandomRegions = (count: number): string[] => {
  const allRegions = Object.keys(regionData)
  const shuffled = [...allRegions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

const EnergyBreakdown = ({ energyMix, compact = false }: { energyMix: RegionData["energyMix"]; compact?: boolean }) => {
  const allEntries = Object.entries(energyMix)
    .filter(([, value]) => value && value > 0)
    .sort(([, a], [, b]) => (b || 0) - (a || 0))

  // Limit to top 6 energy sources by proportion for display
  const entries = allEntries.slice(0, 6)

  // Use all entries for total calculation (for accurate bar proportions)
  const total = allEntries.reduce((sum, [, value]) => sum + (value || 0), 0)

  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      <h4 className={`font-medium text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}>Electricity Sources</h4>
      <div className="h-3 w-full rounded-full overflow-hidden flex">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="h-full"
            style={{
              width: `${((value || 0) / total) * 100}%`,
              backgroundColor: energyColors[key] || "#94a3b8",
            }}
          />
        ))}
      </div>
      <div className={`grid grid-cols-2 ${compact ? "gap-x-2 gap-y-0.5" : "gap-x-4 gap-y-1"}`}>
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div
              className={`rounded-full ${compact ? "h-2 w-2" : "h-2.5 w-2.5"}`}
              style={{ backgroundColor: energyColors[key] || "#94a3b8" }}
            />
            <span className={`text-muted-foreground ${compact ? "text-xs" : "text-xs"}`}>
              {energyLabels[key] || key}
            </span>
            <span className={`font-medium ${compact ? "text-xs" : "text-xs"}`}>{value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const PlaceholderCard = ({
  onSelectRegion,
  compact = false,
  isAnalyzing = false
}: {
  onSelectRegion: (key: string) => void
  compact?: boolean
  isAnalyzing?: boolean
}) => {
  const [searchValue, setSearchValue] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const suggestions = searchValue
    ? Object.keys(regionData)
      .filter((key) => key.toLowerCase().includes(searchValue.toLowerCase()))
      .slice(0, 6)
    : []

  return (
    <Card className={`h-[280px] border-dashed border-2 ${isAnalyzing ? "opacity-50 pointer-events-none" : ""}`}>
      <CardContent className="p-3 h-full flex flex-col items-center justify-center">
        {!isOpen ? (
          <Button
            variant="ghost"
            className="h-full w-full flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsOpen(true)}
            disabled={isAnalyzing}
          >
            <Plus className="h-8 w-8" />
            <span className="text-sm">Add State</span>
          </Button>
        ) : (
          <div className="w-full space-y-2">
            <div className="relative">
              <Input
                placeholder="Search states..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && suggestions.length > 0) {
                    onSelectRegion(suggestions[0])
                    setSearchValue("")
                    setIsOpen(false)
                  }
                  if (e.key === "Escape") {
                    setSearchValue("")
                    setIsOpen(false)
                  }
                }}
                autoFocus
                className="pr-8"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => {
                  setSearchValue("")
                  setIsOpen(false)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 max-h-[180px] overflow-y-auto">
                {suggestions.map((key) => (
                  <Badge
                    key={key}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => {
                      onSelectRegion(key)
                      setSearchValue("")
                      setIsOpen(false)
                    }}
                  >
                    {key
                      .split(" ")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const RegionCard = ({
  regionKey,
  displayName,
  data,
  onRemove,
  compact = false,
  filterValue,
  filterLabel,
  isUserAdded = false,
  isPinned = false,
  onTogglePin,
  layoutId,
  isSelectionMode = false,
  isSelected = false,
  isSelectionDisabled = false,
  onToggleSelection,
}: {
  regionKey: string
  displayName: string
  data: RegionData
  onRemove: () => void
  compact?: boolean
  filterValue?: string
  filterLabel?: string
  isUserAdded?: boolean
  isPinned?: boolean
  onTogglePin?: () => void
  layoutId?: string
  isSelectionMode?: boolean
  isSelected?: boolean
  isSelectionDisabled?: boolean
  onToggleSelection?: () => void
}) => {
  // Determine card styling based on state
  const getCardClasses = () => {
    if (isSelectionMode && isSelected) return "bg-primary/5 border-primary ring-2 ring-primary/20"
    if (isSelectionMode && isSelectionDisabled && !isSelected) return "opacity-50"
    if (isPinned) return "bg-indigo-50/50 border-indigo-200"
    if (isUserAdded) return "bg-sky-50/50 border-sky-200"
    return ""
  }

  const getPriceDivClasses = () => {
    if (isPinned) return "bg-indigo-100"
    if (isUserAdded) return "bg-sky-100"
    return "bg-slate-100"
  }

  return (
    <motion.div
      layoutId={layoutId}
      layout
      transition={{ type: "spring", stiffness: 25, damping: 12 }}
    >
      <Card
        className={`leading-6 h-[280px] ${getCardClasses()} ${isSelectionMode && !isSelectionDisabled ? "cursor-pointer" : ""} ${isSelectionMode && isSelected ? "cursor-pointer" : ""}`}
        onClick={isSelectionMode ? ((!isSelectionDisabled || isSelected) ? onToggleSelection : undefined) : undefined}
      >
        <CardHeader className="p-3 pb-1 pt-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {displayName}
            </CardTitle>
            <div className="flex items-center gap-0.5">
              {isSelectionMode ? (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onToggleSelection?.(); }}
                  disabled={isSelectionDisabled && !isSelected}
                  className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected
                      ? "bg-primary border-primary text-primary-foreground"
                      : isSelectionDisabled
                        ? "border-muted-foreground/30 cursor-not-allowed opacity-40"
                        : "border-muted-foreground/50 hover:border-primary cursor-pointer"
                    }`}
                >
                  {isSelected && (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ) : (
                <>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={onTogglePin}
                        >
                          <Pin className={`h-3 w-3 ${isPinned ? "fill-current" : ""}`} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {isPinned ? "Unpin from board" : "Pin to board"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={onRemove}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        Remove from board
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-2 pb-0">
          <div className={`rounded-lg p-2 text-center ${getPriceDivClasses()}`}>
            <div className="font-bold text-2xl" style={{ color: "#00f" }}>
              ${data.priceUSD.toFixed(2)}
            </div>
            <div className="text-muted-foreground text-xs">per kWh (USD)</div>
          </div>

          <EnergyBreakdown energyMix={data.energyMix} compact={true} />

          <div className="border-t pt-1 flex gap-3 text-xs text-muted-foreground">
            <a
              href={data.priceSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline truncate"
            >
              Price: {data.priceSource}
            </a>
            <a
              href={data.energySourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline truncate"
            >
              Mix: {data.energySource}
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

type FilterCategory = "price" | "renewables" | "nuclear" | "fossilFuels" | "coal"
type FilterOrder = "highest" | "lowest"

export function KwhCalculator() {
  const [searchValue, setSearchValue] = useState("")
  const [filterCategory, setFilterCategory] = useState<FilterCategory>("price")
  const [filterOrder, setFilterOrder] = useState<FilterOrder>("highest")
  const [userAddedRegions, setUserAddedRegions] = useState<{ key: string; displayName: string }[]>([])
  const [pinnedRegions, setPinnedRegions] = useState<Set<string>>(new Set())
  const [hiddenRegions, setHiddenRegions] = useState<Set<string>>(new Set())
  const [removedFilterSlots, setRemovedFilterSlots] = useState(0)
  const [selectedRegions, setSelectedRegions] = useState<{ key: string; displayName: string }[]>(() => {
    const randomKeys = getRandomRegions(4)
    return randomKeys.map((key) => ({
      key,
      displayName: key
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
    }))
  })

  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [showFullAnalysis, setShowFullAnalysis] = useState(false)
  const [isLoadingFullAnalysis, setIsLoadingFullAnalysis] = useState(false)
  const [hasInitialAnalysisRun, setHasInitialAnalysisRun] = useState(false)
  const [regionsChangedSinceAnalysis, setRegionsChangedSinceAnalysis] = useState(false)
  const [lastAnalyzedRegions, setLastAnalyzedRegions] = useState<string[]>([])
  const [ellipsisCount, setEllipsisCount] = useState(1)
  const [followUpInput, setFollowUpInput] = useState("")
  const [followUpMessages, setFollowUpMessages] = useState<{ question: string; response: string }[]>([])
  const [isAskingFollowUp, setIsAskingFollowUp] = useState(false)
  const [isAnalysisCollapsed, setIsAnalysisCollapsed] = useState(false)
  const [expandedFollowUpIndex, setExpandedFollowUpIndex] = useState<number | null>(null)
  const [isPriceDriversExpanded, setIsPriceDriversExpanded] = useState(false)
  const [isPriceDriversSelecting, setIsPriceDriversSelecting] = useState(false)
  const [selectedForComparison, setSelectedForComparison] = useState<Set<string>>(new Set())
  const [preSelectionFilterState, setPreSelectionFilterState] = useState<{
    category: FilterCategory
    order: FilterOrder
    mode: "filter" | "individual"
    visibleCount: number
  }>({ category: "price", order: "highest", mode: "filter", visibleCount: 4 })

  const [pendingFilterChange, setPendingFilterChange] = useState<{ type: 'category' | 'order'; value: string } | null>(null)
  const [filterChangeDialogOpen, setFilterChangeDialogOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [dialogSearchValue, setDialogSearchValue] = useState("")
  const [isFilterBarSearchOpen, setIsFilterBarSearchOpen] = useState(false)
  const [filterBarSearchValue, setFilterBarSearchValue] = useState("")
  const [selectionMode, setSelectionMode] = useState<"filter" | "individual">("filter")
  const [previousFilterState, setPreviousFilterState] = useState<{ category: FilterCategory; order: FilterOrder }>({ category: "price", order: "highest" })
  const [visibleFilterCount, setVisibleFilterCount] = useState(4)
  const [mobileDetailRegion, setMobileDetailRegion] = useState<string | null>(null)

  // Calculate filter value for a region based on category
  const getFilterValue = (data: RegionData, category: FilterCategory): number => {
    const mix = data.energyMix
    switch (category) {
      case "price":
        return data.priceUSD
      case "renewables":
        return (mix.solar || 0) + (mix.wind || 0) + (mix.hydro || 0)
      case "nuclear":
        return mix.nuclear || 0
      case "fossilFuels":
        return (mix.naturalGas || 0) + (mix.coal || 0) + (mix.oil || 0)
      case "coal":
        return mix.coal || 0
      default:
        return 0
    }
  }

  const [filteredStates, setFilteredStates] = useState<{ key: string; displayName: string; value: number }[]>([])

  useEffect(() => {
    // In individual add mode, don't populate filtered states
    if (selectionMode === "individual") {
      setFilteredStates([])
      return
    }

    // Calculate how many slots are available for filtered states (max 6 total)
    const pinnedCount = pinnedRegions.size
    const nonPinnedUserAdded = userAddedRegions.filter((r) => !pinnedRegions.has(r.key)).length
    // Fetch all matching filtered states (not sliced) so we can paginate
    const allFilteredStates = Object.entries(regionData)
      .filter(([key]) => !pinnedRegions.has(key) && !hiddenRegions.has(key) && !userAddedRegions.some(r => r.key === key))
      .map(([key, data]) => ({
        key,
        displayName: key.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        value: getFilterValue(data, filterCategory),
      }))
      .sort((a, b) => filterOrder === "highest" ? b.value - a.value : a.value - b.value)

    // Limit to visibleFilterCount
    const maxFilterSlots = Math.max(0, visibleFilterCount - removedFilterSlots)
    const newFilteredStates = allFilteredStates.slice(0, maxFilterSlots)

    setFilteredStates(newFilteredStates)
  }, [filterCategory, filterOrder, pinnedRegions, hiddenRegions, userAddedRegions, removedFilterSlots, selectionMode, visibleFilterCount])

  useEffect(() => {
    if (!isAnalyzing) return
    const interval = setInterval(() => {
      setEllipsisCount((prev) => (prev % 3) + 1)
    }, 500)
    return () => clearInterval(interval)
  }, [isAnalyzing])

  // Get all currently displayed regions (pinned + filtered + user-added)
  const getDisplayedRegions = () => {
    const displayed: { key: string; displayName: string }[] = []

    // Pinned regions first
    Array.from(pinnedRegions).forEach((key) => {
      if (regionData[key]) {
        displayed.push({
          key,
          displayName: key.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
        })
      }
    })

    // Filtered states (not already in pinned)
    filteredStates.forEach((state) => {
      if (!pinnedRegions.has(state.key)) {
        displayed.push({ key: state.key, displayName: state.displayName })
      }
    })

    // User-added regions (not already in pinned)
    userAddedRegions.forEach((region) => {
      if (!pinnedRegions.has(region.key)) {
        displayed.push(region)
      }
    })

    return displayed
  }

  const runAnalysis = async () => {
    const displayedRegions = getDisplayedRegions()

    if (displayedRegions.length < 1) {
      setAnalysisError("Please select at least one region")
      return
    }

    setAnalysis(null)
    setFollowUpMessages([]) // Clear follow-up messages
    setIsAnalysisCollapsed(false) // Expand analysis
    setIsAnalyzing(true)
    setAnalysisError(null)
    setShowFullAnalysis(false) // Reset full analysis state

    try {
      const regionsForAnalysis = displayedRegions.map((r) => ({
        name: r.displayName,
        price: regionData[r.key].priceUSD,
        energyMix: regionData[r.key].energyMix as Record<string, number>,
      }))
      const avgPrice = regionsForAnalysis.reduce((sum, r) => sum + r.price, 0) / regionsForAnalysis.length
      const result = await analyzeRegionPricing(regionsForAnalysis, avgPrice)
      if (result.success && result.data) {
        setAnalysis(result.data)
        setLastAnalyzedRegions(displayedRegions.map((r) => r.key))
        setRegionsChangedSinceAnalysis(false)
      } else {
        setAnalysisError("Failed to generate analysis")
      }
    } catch (error) {
      setAnalysisError(`Error analyzing regions: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsAnalyzing(false)
      setHasInitialAnalysisRun(true)
    }
  }

  const loadFullAnalysis = async () => {
    if (!analysis?.scoreTable || isLoadingFullAnalysis) return

    setIsLoadingFullAnalysis(true)

    try {
      const regionsForAnalysis = Array.from(selectedForComparison)
        .filter(key => lastAnalyzedRegions.includes(key) && regionData[key])
        .map((key) => ({
          name: key.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
          price: regionData[key].priceUSD,
          energyMix: regionData[key].energyMix as Record<string, number>,
        }))

      const result = await generateFactorAnalyses(regionsForAnalysis, analysis.scoreTable)

      if (result.success && result.data) {
        setAnalysis(prev => prev ? { ...prev, factorAnalyses: result.data } : null)
        setShowFullAnalysis(true)
      }
    } catch (error) {
      console.error("Error loading full analysis:", error)
    } finally {
      setIsLoadingFullAnalysis(false)
    }
  }

  useEffect(() => {
    // Only track region changes after user has clicked "Explore Price Drivers"
    if (hasInitialAnalysisRun) {
      const displayedRegions = getDisplayedRegions()
      const currentKeys = displayedRegions
        .map((r) => r.key)
        .sort()
        .join(",")
      const lastKeys = [...lastAnalyzedRegions].sort().join(",")
      if (currentKeys !== lastKeys) {
        setRegionsChangedSinceAnalysis(true)
      } else {
        setRegionsChangedSinceAnalysis(false)
      }
    }
  }, [filteredStates, pinnedRegions, userAddedRegions, hasInitialAnalysisRun, lastAnalyzedRegions])

  const suggestions = searchValue
    ? Object.keys(regionData)
      .filter(
        (key) => key.toLowerCase().includes(searchValue.toLowerCase()) &&
          !filteredStates.some((s) => s.key === key) &&
          !userAddedRegions.some((r) => r.key === key),
      )
      .slice(0, 6)
    : []

  // Calculate total displayed: pinned + filtered (3) + non-pinned user-added
  const pinnedCount = pinnedRegions.size
  const nonPinnedUserAdded = userAddedRegions.filter((r) => !pinnedRegions.has(r.key)).length
  const totalDisplayedStates = pinnedCount + filteredStates.length + nonPinnedUserAdded

  // Collapse expanded view if all regions are removed
  useEffect(() => {
    if (isPriceDriversExpanded && totalDisplayedStates === 0) {
      setIsPriceDriversExpanded(false)
    }
  }, [isPriceDriversExpanded, totalDisplayedStates])

  const addRegion = (key: string) => {
    const displayName = key
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")

    // Don't add if already in filtered states, user-added, or pinned
    const isInFiltered = filteredStates.some((s) => s.key === key)
    const isInUserAdded = userAddedRegions.some((r) => r.key === key)
    const isInPinned = pinnedRegions.has(key)

    if (!isInFiltered && !isInUserAdded && !isInPinned) {
      setUserAddedRegions((prev) => [...prev, { key, displayName }])
    }
  }

  const removeUserRegion = (key: string) => {
    setUserAddedRegions((prev) => prev.filter((r) => r.key !== key))
    // Also remove from pinned if it was pinned
    setPinnedRegions((prev) => {
      const newSet = new Set(prev)
      newSet.delete(key)
      return newSet
    })
  }

  // Handle filter change - enters filter mode, exits expanded mode if active
  const handleFilterChange = (type: 'category' | 'order', value: string) => {
    setIsPriceDriversExpanded(false)
    setSelectionMode("filter")
    setIsFilterBarSearchOpen(false)
    setFilterBarSearchValue("")
    if (type === 'category') {
      setFilterCategory(value as FilterCategory)
      setFilterOrder("highest")
    } else {
      setFilterOrder(value as FilterOrder)
    }
    // Remove non-pinned individually added states
    setUserAddedRegions((prev) => prev.filter((r) => pinnedRegions.has(r.key)))
    setHiddenRegions(new Set())
    setRemovedFilterSlots(0)
    setVisibleFilterCount(4)
  }

  const togglePinRegion = (key: string) => {
    // Check if this is a filtered state being pinned (not already pinned)
    const isFilteredState = filteredStates.some(s => s.key === key)
    const isCurrentlyPinned = pinnedRegions.has(key)

    setPinnedRegions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
    // Remove from hidden if it was hidden
    setHiddenRegions((prev) => {
      const newSet = new Set(prev)
      newSet.delete(key)
      return newSet
    })

    // Increment removedFilterSlots when pinning a filtered state
    if (isFilteredState && !isCurrentlyPinned) {
      setRemovedFilterSlots(prev => prev + 1)
    }
  }

  const hideFilterRegion = (key: string) => {
    setHiddenRegions((prev) => {
      const newSet = new Set(prev)
      newSet.add(key)
      return newSet
    })
    // Also remove from pinned if it was pinned
    setPinnedRegions((prev) => {
      const newSet = new Set(prev)
      newSet.delete(key)
      return newSet
    })
    // Increment removed slots so the gap doesn't auto-fill
    setRemovedFilterSlots((prev) => prev + 1)
  }

  const removeRegion = (key: string) => {
    setSelectedRegions((prev) => prev.filter((r) => r.key !== key))
  }

  const confirmFilterChange = () => {
    if (pendingFilterChange) {
      setSelectionMode("filter")
      setIsFilterBarSearchOpen(false)
      setFilterBarSearchValue("")
      if (pendingFilterChange.type === 'category') {
        setFilterCategory(pendingFilterChange.value as FilterCategory)
        setFilterOrder("highest")
      } else {
        setFilterOrder(pendingFilterChange.value as FilterOrder)
      }
      setUserAddedRegions((prev) => prev.filter((r) => pinnedRegions.has(r.key)))
      setHiddenRegions(new Set())
      setRemovedFilterSlots(0)
      setVisibleFilterCount(4)
      setIsPriceDriversExpanded(false)
      setPendingFilterChange(null)
      setFilterChangeDialogOpen(false)
    }
  }

  const rollTheDice = () => {
    const randomKeys = getRandomRegions(3)
    setSelectedRegions(
      randomKeys.map((key) => ({
        key,
        displayName: key
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
      })),
    )
  }

  // Calculate filtered states based on category and order
  const calculateFilterValue = (data: RegionData, category: FilterCategory): number => {
    const mix = data.energyMix
    switch (category) {
      case "price":
        return data.priceUSD
      case "renewables":
        return (mix.solar || 0) + (mix.wind || 0) + (mix.hydro || 0)
      case "nuclear":
        return mix.nuclear || 0
      case "fossilFuels":
        return (mix.naturalGas || 0) + (mix.coal || 0) + (mix.oil || 0)
      case "coal":
        return mix.coal || 0
      default:
        return 0
    }
  }

  const validSelectedRegions = selectedRegions.filter((r) => regionData[r.key])
  const averagePrice =
    validSelectedRegions.length > 0
      ? validSelectedRegions.reduce((sum, r) => sum + regionData[r.key].priceUSD, 0) / validSelectedRegions.length
      : 0

  const compact = filteredStates.length > 3

  const handleFollowUpSubmit = async () => {
    if (!followUpInput.trim() || !analysis || isAskingFollowUp) return

    setIsAskingFollowUp(true)
    const question = followUpInput
    setFollowUpInput("")

    try {
      const previousAnalysis = {
        scoreTable: (analysis.scoreTable || []).map((row) => ({
          factor: row.factor,
          scores: row.scores,
          justifications: row.justifications,
        })),
        factorAnalyses: (analysis.factorAnalyses || []).map((f) => ({
          factor: f.factor,
          analysis: f.analysis,
        })),
        synthesis: analysis.synthesis,
      }

      const regions = selectedRegions
        .filter((r) => regionData[r.key])
        .map((r) => ({
          name: r.displayName,
          price: regionData[r.key].priceUSD,
          energyMix: regionData[r.key].energyMix,
        }))

      const result = await askFollowUp(question, previousAnalysis, regions)

      const newIndex = followUpMessages.length
      setFollowUpMessages((prev) => [...prev, { question, response: result.response }])
      setExpandedFollowUpIndex(newIndex)
      setIsAnalysisCollapsed(true)
    } catch (error) {
      console.error("Follow-up error:", error)
    } finally {
      setIsAskingFollowUp(false)
    }
  }

  return (
    <div className="w-full max-w-5xl">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-30 bg-background pb-4 space-y-6">
        {/* Header Section */}
        <div className="py-0">
          <div className="flex items-center justify-center gap-3">
            <h1 className="font-semibold text-3xl">Compare State Electricity Prices and Their Drivers</h1>
          </div>
        </div>

      {/* Filter Controls - Mobile/Tablet - hidden in expanded view, selection mode, and desktop */}
      {!isPriceDriversExpanded && !isPriceDriversSelecting && (
      <div className="flex lg:hidden flex-col gap-2 items-center">
            <p className="text-base font-medium text-foreground text-center">Rank states or add them individually</p>
            <div className={`flex items-center gap-3 ${isAnalyzing ? "opacity-50 pointer-events-none" : ""}`}>
              {/* Filter dropdowns - highlighted when filter mode is active */}
              <div className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors ${selectionMode === "filter" ? "bg-primary/10 ring-1 ring-primary/30" : ""}`}>
                <Select
                  value={filterCategory}
                  onValueChange={(value: FilterCategory) => handleFilterChange('category', value)}
                  disabled={isAnalyzing}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="renewables">Renewables</SelectItem>
                    <SelectItem value="nuclear">Nuclear</SelectItem>
                    <SelectItem value="fossilFuels">Fossil Fuels</SelectItem>
                    <SelectItem value="coal">Coal</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filterOrder}
                  onValueChange={(value: FilterOrder) => handleFilterChange('order', value)}
                  disabled={isAnalyzing}
                >
                  <SelectTrigger className="w-[76px]">
                    <SelectValue>
                      {filterOrder === "highest" ? <ArrowUp className="h-4 w-4 shrink-0" /> : <ArrowDown className="h-4 w-4 shrink-0" />}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="highest">
                      <div className="flex items-center gap-2">
                        <ArrowUp className="h-4 w-4" />
                        <span>Highest</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="lowest">
                      <div className="flex items-center gap-2">
                        <ArrowDown className="h-4 w-4" />
                        <span>Lowest</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="h-8 w-px bg-foreground/30" />

              {/* Add button / inline search */}
              {selectionMode === "individual" && isFilterBarSearchOpen ? (
                <div className="relative flex items-center">
                  <Input
                    placeholder="Search state..."
                    value={filterBarSearchValue}
                    onChange={(e) => setFilterBarSearchValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const match = Object.keys(regionData).find((key) =>
                          key.toLowerCase().includes(filterBarSearchValue.toLowerCase())
                        )
                        if (match) {
                          addRegion(match)
                          setFilterBarSearchValue("")
                        }
                      }
                      if (e.key === "Escape") {
                        setIsFilterBarSearchOpen(false)
                        setFilterBarSearchValue("")
                        if (totalDisplayedStates === 0) {
                          setSelectionMode("filter")
                          setFilterCategory(previousFilterState.category)
                          setFilterOrder(previousFilterState.order)
                        }
                      }
                    }}
                    autoFocus
                    className="w-[130px] h-8 pr-7 text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6"
                    onClick={() => {
                      setIsFilterBarSearchOpen(false)
                      setFilterBarSearchValue("")
                      if (totalDisplayedStates === 0) {
                        setSelectionMode("filter")
                        setFilterCategory(previousFilterState.category)
                        setFilterOrder(previousFilterState.order)
                      }
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPreviousFilterState({ category: filterCategory, order: filterOrder })
                    setIsFilterBarSearchOpen(true)
                    setSelectionMode("individual")
                    setFilterCategory("price")
                    setFilterOrder("highest")
                    setFilteredStates([])
                    setHiddenRegions(new Set())
                    setRemovedFilterSlots(0)
                  }}
                  disabled={isAnalyzing}
                  className="h-8 w-8 p-0 sm:w-auto sm:px-3 sm:gap-2"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline text-sm">Add a State</span>
                </Button>
              )}
            </div>
            {/* Mobile search suggestions dropdown */}
            {selectionMode === "individual" && isFilterBarSearchOpen && filterBarSearchValue.trim() && (
              <div className="flex flex-wrap gap-2 justify-center">
                {Object.keys(regionData)
                  .filter((key) => key.toLowerCase().includes(filterBarSearchValue.toLowerCase()))
                  .filter((key) => !pinnedRegions.has(key) && !userAddedRegions.some((r) => r.key === key) && !filteredStates.some((s) => s.key === key))
                  .slice(0, 5)
                  .map((key) => (
                    <Badge
                      key={key}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => {
                        addRegion(key)
                        setFilterBarSearchValue("")
                      }}
                    >
                      {key.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                    </Badge>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Filter Controls - visible but disabled during analysis, hidden in selection mode (desktop only) */}
        {!isPriceDriversSelecting && (
          <div className={`hidden lg:flex flex-col gap-2 items-center justify-center`}>
            {/* Select New States button - shown when analysis is complete (desktop only) */}
            {isPriceDriversExpanded && analysis !== null && !isAnalyzing && (
              <Button
                variant="secondary"
                className="hidden lg:flex items-center gap-2 animate-in fade-in duration-1000"
                onClick={() => {
                  setIsPriceDriversExpanded(false)
                  setIsPriceDriversSelecting(false)
                  setSelectedForComparison(new Set())
                  setAnalysis(null)
                  // Restore pre-selection state
                  setFilterCategory(preSelectionFilterState.category)
                  setFilterOrder(preSelectionFilterState.order)
                  setSelectionMode(preSelectionFilterState.mode)
                  setVisibleFilterCount(preSelectionFilterState.visibleCount)
                }}
              >
                <Sun className="h-4 w-4" />
                Select New States
              </Button>
            )}
            {/* Filter Controls - visible when not expanded OR during analysis, disabled during analysis */}
            {(!isPriceDriversExpanded || (isPriceDriversExpanded && isAnalyzing)) && (
              <div className="flex flex-col gap-2 items-center">
                {/* Filter buttons and Add a State button row */}
                <div className={`flex flex-row gap-3 items-start transition-opacity duration-300 ${isAnalyzing ? "opacity-50 pointer-events-none" : ""}`}>
                  {/* Filter group with help text */}
                  <div className="flex flex-col gap-2 items-center">
                    <p className="text-sm text-foreground">Rank states by price and energy mix</p>

                    <div className="flex flex-row gap-3 items-center">
                      {/* Category Filter */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="inline-flex rounded-lg border bg-muted p-1 gap-1">
                            {(["price", "renewables", "nuclear", "fossilFuels", "coal"] as FilterCategory[]).map((category) => (
                              <button
                                key={category}
                                disabled={isAnalyzing}
                                onClick={() => handleFilterChange('category', category)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${selectionMode === "filter" && filterCategory === category
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                  } ${isAnalyzing ? "cursor-not-allowed" : ""}`}
                              >
                                {category === "price" && "Price"}
                                {category === "renewables" && "Renewables"}
                                {category === "nuclear" && "Nuclear"}
                                {category === "fossilFuels" && "Fossil Fuels"}
                                {category === "coal" && "Coal"}
                              </button>
                            ))}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">Select category to filter by</TooltipContent>
                      </Tooltip>

                      {/* Order Filter */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="inline-flex rounded-lg border bg-muted p-1 gap-1">
                            {(["highest", "lowest"] as FilterOrder[]).map((order) => (
                              <button
                                key={order}
                                disabled={isAnalyzing}
                                onClick={() => handleFilterChange('order', order)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${selectionMode === "filter" && filterOrder === order
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                  } ${isAnalyzing ? "cursor-not-allowed" : ""}`}
                              >
                                {order === "highest" ? "Highest" : "Lowest"}
                              </button>
                            ))}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">Sort by highest or lowest</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Vertical separator */}
                  <div className="h-20 w-px bg-foreground/20" />

                  {/* Add a State group with help text */}
                  <div className="flex flex-col gap-2 items-center">
                    <p className="text-sm text-foreground">Or select states individually</p>

                    {!isFilterBarSearchOpen ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Save current filter state before switching to individual mode
                          setPreviousFilterState({ category: filterCategory, order: filterOrder })
                          setIsFilterBarSearchOpen(true)
                          // Enter individual add mode
                          setSelectionMode("individual")
                          // Reset filter bar so no filters appear selected
                          setFilterCategory("price")
                          setFilterOrder("highest")
                          // Clear filtered states and non-pinned filter-based states
                          setFilteredStates([])
                          setHiddenRegions(new Set())
                          setRemovedFilterSlots(0)
                        }}
                        className="flex items-center gap-2"
                        disabled={isAnalyzing}
                      >
                        <Search className="h-4 w-4" />
                        Add a State
                      </Button>
                    ) : (
                      <div className="w-full space-y-2">
                        <div className="relative">
                          <Input
                            placeholder="Search for a US state..."
                            value={filterBarSearchValue}
                            onChange={(e) => setFilterBarSearchValue(e.target.value)}
                            onKeyDown={(e) => {
                              const fbSuggestions = filterBarSearchValue.trim()
                                ? Object.keys(regionData)
                                  .filter(
                                    (key) =>
                                      key.toLowerCase().includes(filterBarSearchValue.toLowerCase()) &&
                                      !filteredStates.some((s) => s.key === key) &&
                                      !userAddedRegions.some((r) => r.key === key)
                                  )
                                  .slice(0, 5)
                                : []
                              if (e.key === "Enter" && fbSuggestions.length > 0) {
                                addRegion(fbSuggestions[0])
                                setFilterBarSearchValue("")
                                setIsFilterBarSearchOpen(false)
                              }
                              if (e.key === "Escape") {
                                setIsFilterBarSearchOpen(false)
                                setFilterBarSearchValue("")
                                // If no states are displayed, revert to previous filter state
                                if (totalDisplayedStates === 0) {
                                  setSelectionMode("filter")
                                  setFilterCategory(previousFilterState.category)
                                  setFilterOrder(previousFilterState.order)
                                }
                              }
                            }}
                            autoFocus
                            className="pr-10"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                            onClick={() => {
                              setIsFilterBarSearchOpen(false)
                              setFilterBarSearchValue("")
                              // If no states are displayed, revert to previous filter state
                              if (totalDisplayedStates === 0) {
                                setSelectionMode("filter")
                                setFilterCategory(previousFilterState.category)
                                setFilterOrder(previousFilterState.order)
                              }
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {filterBarSearchValue.trim() && (() => {
                          const fbSuggestions = Object.keys(regionData)
                            .filter(
                              (key) =>
                                key.toLowerCase().includes(filterBarSearchValue.toLowerCase()) &&
                                !filteredStates.some((s) => s.key === key) &&
                                !userAddedRegions.some((r) => r.key === key)
                            )
                            .slice(0, 5)
                          return fbSuggestions.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {fbSuggestions.map((key) => (
                                <Badge
                                  key={key}
                                  variant="secondary"
                                  className="cursor-pointer hover:bg-secondary/80"
                                  onClick={() => {
                                    addRegion(key)
                                    setFilterBarSearchValue("")
                                    setIsFilterBarSearchOpen(false)
                                  }}
                                >
                                  {key
                                    .split(" ")
                                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                                    .join(" ")}
                                </Badge>
                              ))}
                            </div>
                          ) : null
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Info icon - mobile/tablet only (below lg) */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="lg:hidden p-3 text-muted-foreground hover:text-foreground active:text-foreground touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <Info className="size-6" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="bottom" className="max-w-[200px] text-center text-sm p-3 text-popover-foreground bg-amber-50">
                Rank and select states by price and energy mix
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Selection Mode UI - shown when user clicks Explore Price Drivers */}
        {isPriceDriversSelecting && !isPriceDriversExpanded && (
          <div className="flex flex-col gap-2 items-center lg:items-start">
            <p className="text-sm text-foreground">Select up to 3 states for comparison</p>
            <div className="flex items-center gap-3">
              <Button
                variant="default"
                size="sm"
                disabled={selectedForComparison.size < 2}
                onClick={() => {
                  // Run analysis with selected states only
                  const selectedRegions = Array.from(selectedForComparison).map((key) => ({
                    key,
                    displayName: key.split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
                  }))

                  // Set up analysis with only selected regions
                  const regionsForAnalysis = selectedRegions.map((r) => ({
                    name: r.displayName,
                    price: regionData[r.key].priceUSD,
                    energyMix: regionData[r.key].energyMix as Record<string, number>,
                  }))

                  setAnalysis(null)
                  setFollowUpMessages([])
                  setIsAnalysisCollapsed(false)
                  setIsAnalyzing(true)
                  setAnalysisError(null)
                  setShowFullAnalysis(false)
                  setIsPriceDriversExpanded(true)

                  const avgPrice = regionsForAnalysis.reduce((sum, r) => sum + r.price, 0) / regionsForAnalysis.length
                  analyzeRegionPricing(regionsForAnalysis, avgPrice).then((result) => {
                    if (result.success && result.data) {
                      setAnalysis(result.data)
                      setLastAnalyzedRegions(selectedRegions.map((r) => r.key))
                      setRegionsChangedSinceAnalysis(false)
                    } else {
                      setAnalysisError("Failed to generate analysis")
                    }
                  }).catch((error) => {
                    setAnalysisError(`Error analyzing regions: ${error instanceof Error ? error.message : "Unknown error"}`)
                  }).finally(() => {
                    setIsAnalyzing(false)
                    setHasInitialAnalysisRun(true)
                  })
                }}
                className="flex items-center gap-2"
              >
                Compare {selectedForComparison.size}/3
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsPriceDriversSelecting(false)
                  setSelectedForComparison(new Set())
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Price Drivers Button & Factor Headers - hidden when in selection mode (not yet expanded) */}
        <div className={`flex items-center gap-2 pt-0 ${isPriceDriversExpanded ? "mt-0 lg:grid lg:grid-cols-4 lg:gap-4" : "mt-2"} ${isPriceDriversSelecting && !isPriceDriversExpanded ? "hidden" : ""}`}>
          <div className="flex items-center gap-2">
            {/* Mobile/Tablet: Show Select New States when analysis complete */}
            {isPriceDriversExpanded && analysis !== null && !isAnalyzing ? (
              <Button
                variant="secondary"
                className="flex lg:hidden items-center gap-2 animate-in fade-in duration-1000"
                onClick={() => {
                  setIsPriceDriversExpanded(false)
                  setIsPriceDriversSelecting(false)
                  setSelectedForComparison(new Set())
                  setAnalysis(null)
                  // Restore pre-selection state
                  setFilterCategory(preSelectionFilterState.category)
                  setFilterOrder(preSelectionFilterState.order)
                  setSelectionMode(preSelectionFilterState.mode)
                  setVisibleFilterCount(preSelectionFilterState.visibleCount)
                }}
              >
                <Sun className="h-4 w-4" />
                Select New States
              </Button>
            ) : null}

            {/* Desktop: Show Select New States when analysis complete */}
            {isPriceDriversExpanded && analysis !== null && !isAnalyzing ? (
              <Button
                variant="secondary"
                className="hidden lg:flex items-center gap-2 animate-in fade-in duration-1000"
                onClick={() => {
                  setIsPriceDriversExpanded(false)
                  setIsPriceDriversSelecting(false)
                  setSelectedForComparison(new Set())
                  setAnalysis(null)
                  // Restore pre-selection state
                  setFilterCategory(preSelectionFilterState.category)
                  setFilterOrder(preSelectionFilterState.order)
                  setSelectionMode(preSelectionFilterState.mode)
                  setVisibleFilterCount(preSelectionFilterState.visibleCount)
                }}
              >
                <Sun className="h-4 w-4" />
                Select New States
              </Button>
            ) : null}

            {/* Price Drivers button - hidden on all views when expanded and analysis complete */}
            <Button
              variant="secondary"
              className={`flex items-center gap-2  ${isPriceDriversExpanded && analysis !== null && !isAnalyzing ? "hidden" : ""}`}
              onClick={() => {
                // Save current state before entering selection mode
                setPreSelectionFilterState({
                  category: filterCategory,
                  order: filterOrder,
                  mode: selectionMode,
                  visibleCount: visibleFilterCount,
                })
                setSelectedForComparison(new Set())
                setIsPriceDriversSelecting(true)
              }}
              disabled={isAnalyzing || isPriceDriversSelecting || totalDisplayedStates === 0 || (analysis !== null && !regionsChangedSinceAnalysis)}
            >
              {isAnalyzing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              {isAnalyzing ? (
                <span className="inline-flex w-[100px]">
                  Analyzing<span className="w-[18px] text-left">{".".repeat(ellipsisCount)}</span>
                </span>
              ) : (
                "Explore Price Drivers"
              )}
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="p-3 text-muted-foreground hover:text-foreground active:text-foreground transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <Info className="size-6" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="bottom" className="w-[320px] p-4 text-left text-popover-foreground bg-amber-50">
                <p className="text-sm mb-3"><span className="font-semibold">Price Drivers</span> compares regions across the key factors that influence electricity prices. Using public data from grid operators and regulators, we assess how regions differ and whether those differences help or hinder low-cost power across seven cost drivers:</p>
                <ul className="text-sm space-y-1 mb-3 list-disc list-inside">
                  <li>Fuel and generation costs</li>
                  <li>Transmission and distribution</li>
                  <li>Regulatory structure and utility model</li>
                  <li>State and federal policies</li>
                  <li>Wholesale market conditions</li>
                  <li>Geography and local conditions</li>
                  <li>Reliability and resilience costs</li>
                </ul>
                <p className="text-sm">From this list we select the <span className="font-semibold">3 factors that best explain price differences</span> between the selected regions are shown.</p>
              </PopoverContent>
            </Popover>
          </div>

          {/* Factor Column Headers - only visible in expanded view on desktop (lg+) */}
          {isPriceDriversExpanded && (
            <div className="hidden lg:contents">
              {isAnalyzing ? (
                // Skeleton headers while loading
                [0, 1, 2].map((idx) => (
                  <div key={idx} className="flex justify-center">
                    <Skeleton className="h-5 w-32" />
                  </div>
                ))
              ) : (
                // Actual factor headers
                analysis?.scoreTable?.slice(0, 3).map((row, idx) => (
                  <div key={idx} className="text-center text-black text-sm font-semibold">
                    {row.factor}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>{/* End sticky header */}

      <div className="space-y-6 pt-2">
        <LayoutGroup>
          {/* Normal Grid View */}
          {!isPriceDriversExpanded && (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 lg:grid-cols-4">
              {/* All pinned regions first (both user-added and filter-generated) */}
              {Array.from(pinnedRegions)
                .filter((key) => regionData[key])
                .map((key) => {
                  const isUserAddedRegion = userAddedRegions.some((r) => r.key === key)
                  return (
                    <RegionCard
                      key={key}
                      regionKey={key}
                      displayName={key.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                      data={regionData[key]}
                      onRemove={() => isUserAddedRegion ? removeUserRegion(key) : hideFilterRegion(key)}
                      compact={compact}
                      isUserAdded={isUserAddedRegion}
                      isPinned={true}
                      onTogglePin={() => togglePinRegion(key)}
                      layoutId={`card-${key}`}
                      isSelectionMode={isPriceDriversSelecting}
                      isSelected={selectedForComparison.has(key)}
                      isSelectionDisabled={selectedForComparison.size >= 3}
                      onToggleSelection={() => {
                        setSelectedForComparison((prev) => {
                          const next = new Set(prev)
                          if (next.has(key)) next.delete(key)
                          else if (next.size < 3) next.add(key)
                          return next
                        })
                      }}
                    />
                  )
                })}
              {/* Filtered states (excluding pinned) */}
              {filteredStates.map((state) => (
                <RegionCard
                  key={state.key}
                  regionKey={state.key}
                  displayName={state.displayName}
                  data={regionData[state.key]}
                  onRemove={() => hideFilterRegion(state.key)}
                  compact={compact}
                  filterValue={filterCategory !== "price" ? `${state.value}%` : undefined}
                  filterLabel={filterCategory !== "price" ? filterCategory : undefined}
                  isPinned={pinnedRegions.has(state.key)}
                  onTogglePin={() => togglePinRegion(state.key)}
                  layoutId={`card-${state.key}`}
                  isSelectionMode={isPriceDriversSelecting}
                  isSelected={selectedForComparison.has(state.key)}
                  isSelectionDisabled={selectedForComparison.size >= 3}
                  onToggleSelection={() => {
                    setSelectedForComparison((prev) => {
                      const next = new Set(prev)
                      if (next.has(state.key)) next.delete(state.key)
                      else if (next.size < 3) next.add(state.key)
                      return next
                    })
                  }}
                />
              ))}
              {/* Non-pinned user-added regions */}
              {userAddedRegions
                .filter((region) => !pinnedRegions.has(region.key))
                .map((region) => (
                  <RegionCard
                    key={region.key}
                    regionKey={region.key}
                    displayName={region.displayName}
                    data={regionData[region.key]}
                    onRemove={() => removeUserRegion(region.key)}
                    compact={compact}
                    isUserAdded={true}
                    isPinned={false}
                    onTogglePin={() => togglePinRegion(region.key)}
                    layoutId={`card-${region.key}`}
                    isSelectionMode={isPriceDriversSelecting}
                    isSelected={selectedForComparison.has(region.key)}
                    isSelectionDisabled={selectedForComparison.size >= 3}
                    onToggleSelection={() => {
                      setSelectedForComparison((prev) => {
                        const next = new Set(prev)
                        if (next.has(region.key)) next.delete(region.key)
                        else if (next.size < 3) next.add(region.key)
                        return next
                      })
                    }}
                  />
                ))}

            </div>
          )}

          {/* Show more affordance - only in filter mode when there are more states available, hidden in selection mode */}
          {selectionMode === "filter" && !isPriceDriversExpanded && !isPriceDriversSelecting && (() => {
            const totalAvailable = Object.entries(regionData)
              .filter(([key]) => !pinnedRegions.has(key) && !hiddenRegions.has(key) && !userAddedRegions.some(r => r.key === key))
              .length
            const currentlyShowing = filteredStates.length
            const remaining = totalAvailable - currentlyShowing

            if (remaining <= 0) return null

            return (
              <div className="flex items-center justify-center gap-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Showing {currentlyShowing} of {totalAvailable} states
                  </span>
                  <div className="inline-flex rounded-lg border bg-muted p-1 gap-1">
                    {[4, 8, 12, 24].filter(n => n <= totalAvailable).map((count) => (
                      <button
                        key={count}
                        onClick={() => setVisibleFilterCount(count)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${visibleFilterCount === count && visibleFilterCount !== totalAvailable
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        {count}
                      </button>
                    ))}
                    <button
                      onClick={() => setVisibleFilterCount(totalAvailable)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${visibleFilterCount >= totalAvailable
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      All
                    </button>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Expanded Price Drivers View */}
          {isPriceDriversExpanded && (
            <div className="space-y-2 animate-in fade-in duration-300">

              {/* Phone Summary View */}
              <div className="sm:hidden space-y-3">
                {(() => {
                  const allRegions = [
                    ...Array.from(pinnedRegions).filter((key) => regionData[key]).map((key) => ({
                      key,
                      displayName: key.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
                      isUserAdded: userAddedRegions.some((r) => r.key === key),
                      isPinned: true,
                    })),
                    ...filteredStates.filter((s) => !pinnedRegions.has(s.key)).map((state) => ({
                      key: state.key,
                      displayName: state.displayName,
                      isUserAdded: false,
                      isPinned: false,
                    })),
                    ...userAddedRegions.filter((r) => !pinnedRegions.has(r.key)).map((region) => ({
                      key: region.key,
                      displayName: region.displayName,
                      isUserAdded: true,
                      isPinned: false,
                    })),
                  ].filter((r) => selectedForComparison.has(r.key))

                  // Calculate overall score for each region
                  const getOverallScore = (regionKey: string, displayName: string) => {
                    if (!analysis?.scoreTable || !lastAnalyzedRegions.includes(regionKey)) return null
                    let total = 0
                    let count = 0
                    for (const factor of analysis.scoreTable.slice(0, 3)) {
                      const score = factor.scores[displayName] ?? factor.scores[regionKey] ?? 0
                      total += score
                      count++
                    }
                    return count > 0 ? total : null
                  }

                  // Helper to get factor score for a region
                  const getFactorScore = (regionKey: string, displayName: string, factorIndex: number) => {
                    if (!analysis?.scoreTable || !lastAnalyzedRegions.includes(regionKey)) return null
                    const factor = analysis.scoreTable[factorIndex]
                    if (!factor) return null
                    return factor.scores[displayName] ?? factor.scores[regionKey] ?? 0
                  }

                  // Helper to get price div background classes matching unexpanded cards
                  const getPriceDivClasses = (isPinned: boolean, isUserAdded: boolean) => {
                    if (isPinned) return "bg-indigo-100"
                    if (isUserAdded) return "bg-sky-100"
                    return "bg-slate-100"
                  }

                  return (
                    <>
                      {/* Expanded Region Cards with Factor Accordions */}
                      <div className="space-y-3">
                        {allRegions.map((region, idx) => {
                          const isAnalyzed = lastAnalyzedRegions.includes(region.key)

                          return (
                            <Card
                              key={region.key}
                              className={`w-full ${region.isPinned ? "bg-indigo-50/50 border-indigo-200" :
                                  region.isUserAdded ? "bg-sky-50/50 border-sky-200" :
                                    ""
                                }`}
                              style={{
                                animation: `morphToColumn 0.4s ease-out ${idx * 0.08}s both`,
                              }}
                            >
                              <CardHeader className="p-3 pb-1 pt-3">
                                <CardTitle className="text-base flex items-center gap-1.5">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {region.displayName}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="p-3 pt-0 space-y-2">
                                {/* Price display matching unexpanded cards */}
                                <div className={`rounded-lg p-2 text-center ${getPriceDivClasses(region.isPinned, region.isUserAdded)}`}>
                                  <div className="font-bold text-2xl" style={{ color: "#00f" }}>
                                    ${regionData[region.key].priceUSD.toFixed(2)}
                                  </div>
                                  <div className="text-muted-foreground text-xs">per kWh (USD)</div>
                                </div>

                                {/* Electricity Sources */}
                                <EnergyBreakdown energyMix={regionData[region.key].energyMix} compact={true} />

                                {/* Data Sources */}
                                <div className="border-t pt-1 flex gap-3 text-xs text-muted-foreground">
                                  <a
                                    href={regionData[region.key].priceSourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline truncate"
                                  >
                                    Price: {regionData[region.key].priceSource}
                                  </a>
                                  <a
                                    href={regionData[region.key].energySourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline truncate"
                                  >
                                    Mix: {regionData[region.key].energySource}
                                  </a>
                                </div>

                                {/* Factor Analysis - below sources */}
                                {!isAnalyzing && analysis?.scoreTable && isAnalyzed && (
                                  <div className="w-full border-t pt-2 space-y-3">
                                    {analysis.scoreTable.slice(0, 3).map((factor, factorIdx) => {
                                      const score = getFactorScore(region.key, region.displayName, factorIdx)
                                      const justification = factor.justifications?.[region.displayName] ?? factor.justifications?.[region.key] ?? ""

                                      return (
                                        <div key={factorIdx} className="space-y-1">
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{factor.factor}</span>
                                            <span className={`text-sm font-bold px-2 py-0.5 rounded ${score && score > 0 ? "bg-green-100 text-green-700" :
                                                score && score < 0 ? "bg-red-100 text-red-700" :
                                                  "bg-gray-100 text-gray-600"
                                              }`}>
                                              {score !== null ? (score > 0 ? `+${score}` : score) : "—"}
                                            </span>
                                          </div>
                                          {justification ? (
                                            <p className="text-sm leading-relaxed text-foreground">{justification}</p>
                                          ) : (
                                            <p className="text-xs text-muted-foreground">No explanation available.</p>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}

                                {/* Loading skeleton for factors */}
                                {isAnalyzing && (
                                  <div className="space-y-2 border-t pt-2">
                                    {[0, 1, 2].map((i) => (
                                      <Skeleton key={i} className="h-10 w-full" />
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>

                      {/* Full Analysis Button - Phone */}
                      {!isAnalyzing && analysis?.scoreTable && !showFullAnalysis && (
                        <div className="flex justify-center">
                          <Button
                            variant="outline"
                            onClick={loadFullAnalysis}
                            disabled={isLoadingFullAnalysis}
                            className="gap-2 bg-transparent"
                          >
                            {isLoadingFullAnalysis ? (
                              <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Loading...
                              </>
                            ) : (
                              <>
                                <FileText className="h-4 w-4" />
                                Full Analysis
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Detailed Factor Analysis - Phone */}
                      {!isAnalyzing && showFullAnalysis && analysis?.factorAnalyses && analysis.factorAnalyses.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">Detailed Factor Analysis</h4>
                          {analysis.factorAnalyses.map((factor, idx) => (
                            <Card key={idx}>
                              <CardContent className="p-3">
                                <h5 className="text-sm mb-2 font-semibold">{factor.factor}</h5>
                                <p className="text-xs leading-relaxed text-foreground">{factor.analysis}</p>
                                {factor.sources && factor.sources.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {factor.sources.map((source, sIdx) => (
                                      <a
                                        key={sIdx}
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline"
                                      >
                                        [{source.label}]
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      {/* Synthesis Summary */}
                      {!isAnalyzing && showFullAnalysis && analysis?.synthesis && (
                        <Card className="bg-slate-50">
                          <CardContent className="p-3">
                            <h4 className="text-sm mb-2 font-semibold">Summary</h4>
                            <p className="text-sm text-foreground">{analysis.synthesis}</p>
                            {analysis.synthesisSources && analysis.synthesisSources.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {analysis.synthesisSources.map((source, idx) => (
                                  <a
                                    key={idx}
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline"
                                  >
                                    [{source.label}]
                                  </a>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )
                })()}
              </div>

              {/* Tablet View - 2 column grid with accordion cards (sm to lg) */}
              <div className="hidden sm:block lg:hidden">
                {(() => {
                  const allRegions = [
                    ...Array.from(pinnedRegions).filter((key) => regionData[key]).map((key) => ({
                      key,
                      displayName: key.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
                      isUserAdded: userAddedRegions.some((r) => r.key === key),
                      isPinned: true,
                    })),
                    ...filteredStates.filter((s) => !pinnedRegions.has(s.key)).map((state) => ({
                      key: state.key,
                      displayName: state.displayName,
                      isUserAdded: false,
                      isPinned: false,
                    })),
                    ...userAddedRegions.filter((r) => !pinnedRegions.has(r.key)).map((region) => ({
                      key: region.key,
                      displayName: region.displayName,
                      isUserAdded: true,
                      isPinned: false,
                    })),
                  ].filter((r) => selectedForComparison.has(r.key))

                  // Helper to get factor score for a region
                  const getFactorScore = (regionKey: string, displayName: string, factorIndex: number) => {
                    if (!analysis?.scoreTable || !lastAnalyzedRegions.includes(regionKey)) return null
                    const factor = analysis.scoreTable[factorIndex]
                    if (!factor) return null
                    return factor.scores[displayName] ?? factor.scores[regionKey] ?? 0
                  }

                  // Helper to get price div background classes
                  const getPriceDivClasses = (isPinned: boolean, isUserAdded: boolean) => {
                    if (isPinned) return "bg-indigo-100"
                    if (isUserAdded) return "bg-sky-100"
                    return "bg-slate-100"
                  }

                  return (
                    <>
                      <div className="grid grid-cols-3 gap-3">
                        {allRegions.map((region, idx) => {
                          const isAnalyzed = lastAnalyzedRegions.includes(region.key)

                          return (
                            <Card
                              key={region.key}
                              className={`w-full ${region.isPinned ? "bg-indigo-50/50 border-indigo-200" :
                                  region.isUserAdded ? "bg-sky-50/50 border-sky-200" :
                                    ""
                                }`}
                              style={{
                                animation: `morphToColumn 0.4s ease-out ${idx * 0.08}s both`,
                              }}
                            >
                              <CardHeader className="p-3 pb-1 pt-3">
                                <CardTitle className="text-base flex items-center gap-1.5">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {region.displayName}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="p-3 pt-0 space-y-2">
                                {/* Price display */}
                                <div className={`rounded-lg p-2 text-center ${getPriceDivClasses(region.isPinned, region.isUserAdded)}`}>
                                  <div className="font-bold text-2xl" style={{ color: "#00f" }}>
                                    ${regionData[region.key].priceUSD.toFixed(2)}
                                  </div>
                                  <div className="text-muted-foreground text-xs">per kWh (USD)</div>
                                </div>

                                {/* Electricity Sources */}
                                <EnergyBreakdown energyMix={regionData[region.key].energyMix} compact={true} />

                                {/* Data Sources */}
                                <div className="border-t pt-1 flex gap-3 text-xs text-muted-foreground">
                                  <a
                                    href={regionData[region.key].priceSourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline truncate"
                                  >
                                    Price: {regionData[region.key].priceSource}
                                  </a>
                                  <a
                                    href={regionData[region.key].energySourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline truncate"
                                  >
                                    Mix: {regionData[region.key].energySource}
                                  </a>
                                </div>

                                {/* Factor Analysis */}
                                {!isAnalyzing && analysis?.scoreTable && isAnalyzed && (
                                  <div className="w-full border-t pt-2 space-y-3">
                                    {analysis.scoreTable.slice(0, 3).map((factor, factorIdx) => {
                                      const score = getFactorScore(region.key, region.displayName, factorIdx)
                                      const justification = factor.justifications?.[region.displayName] ?? factor.justifications?.[region.key] ?? ""

                                      return (
                                        <div key={factorIdx} className="space-y-1">
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{factor.factor}</span>
                                            <span className={`text-sm font-bold px-2 py-0.5 rounded ${score && score > 0 ? "bg-green-100 text-green-700" :
                                                score && score < 0 ? "bg-red-100 text-red-700" :
                                                  "bg-gray-100 text-gray-600"
                                              }`}>
                                              {score !== null ? (score > 0 ? `+${score}` : score) : "—"}
                                            </span>
                                          </div>
                                          {justification ? (
                                            <p className="text-sm leading-relaxed text-foreground">{justification}</p>
                                          ) : (
                                            <p className="text-xs text-muted-foreground">No explanation available.</p>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}

                                {/* Loading skeleton for factors */}
                                {isAnalyzing && (
                                  <div className="space-y-2 border-t pt-2">
                                    {[0, 1, 2].map((i) => (
                                      <Skeleton key={i} className="h-10 w-full" />
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>

                      {/* Full Analysis Button - Tablet */}
                      {!isAnalyzing && analysis?.scoreTable && !showFullAnalysis && (
                        <div className="flex justify-center mt-3">
                          <Button
                            variant="outline"
                            onClick={loadFullAnalysis}
                            disabled={isLoadingFullAnalysis}
                            className="gap-2 bg-transparent"
                          >
                            {isLoadingFullAnalysis ? (
                              <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Loading...
                              </>
                            ) : (
                              <>
                                <FileText className="h-4 w-4" />
                                Full Analysis
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Detailed Factor Analysis - Tablet */}
                      {!isAnalyzing && showFullAnalysis && analysis?.factorAnalyses && analysis.factorAnalyses.length > 0 && (
                        <div className="space-y-3 mt-3">
                          <h4 className="font-semibold text-sm">Detailed Factor Analysis</h4>
                          {analysis.factorAnalyses.map((factor, idx) => (
                            <Card key={idx}>
                              <CardContent className="p-3">
                                <h5 className="text-sm mb-2 font-semibold">{factor.factor}</h5>
                                <p className="leading-relaxed text-sm text-foreground">{factor.analysis}</p>
                                {factor.sources && factor.sources.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {factor.sources.map((source, sIdx) => (
                                      <a
                                        key={sIdx}
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline"
                                      >
                                        [{source.label}]
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      {/* Synthesis Summary for tablet */}
                      {!isAnalyzing && showFullAnalysis && analysis?.synthesis && (
                        <Card className="bg-slate-50 mt-3">
                          <CardContent className="p-3">
                            <h4 className="text-sm mb-2 font-semibold">Summary</h4>
                            <p className="text-sm text-foreground">{analysis.synthesis}</p>
                            {analysis.synthesisSources && analysis.synthesisSources.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {analysis.synthesisSources.map((source, idx) => (
                                  <a
                                    key={idx}
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline"
                                  >
                                    [{source.label}]
                                  </a>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )
                })()}
              </div>

              {/* Desktop Stacked Region Cards with Factor Scores (lg+) */}
              <div className="hidden lg:flex flex-col gap-2">
                {/* Only selected regions for comparison */}
                {(() => {
                  const allRegions = [
                    ...Array.from(pinnedRegions).filter((key) => regionData[key]).map((key) => ({
                      key,
                      displayName: key.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
                      isUserAdded: userAddedRegions.some((r) => r.key === key),
                      isPinned: true,
                    })),
                    ...filteredStates.filter((s) => !pinnedRegions.has(s.key)).map((state) => ({
                      key: state.key,
                      displayName: state.displayName,
                      isUserAdded: false,
                      isPinned: false,
                    })),
                    ...userAddedRegions.filter((r) => !pinnedRegions.has(r.key)).map((region) => ({
                      key: region.key,
                      displayName: region.displayName,
                      isUserAdded: true,
                      isPinned: false,
                    })),
                  ].filter((r) => selectedForComparison.has(r.key))

                  return allRegions.map((region, idx) => (
                    <motion.div
                      key={region.key}
                      layoutId={`card-${region.key}`}
                      layout
                      transition={{ type: "spring", stiffness: 25, damping: 12 }}
                    >
                      <Card
                        className={`w-full ${region.isPinned ? "bg-indigo-50/50 border-indigo-200" : region.isUserAdded ? "bg-sky-50/50 border-sky-200" : ""}`}
                      >
                        <CardContent className="p-3 py-0">
                          <div className="grid grid-cols-4 gap-4 items-start">
                            {/* Column 1: Original Card Content */}
                            <div className="space-y-2">
                              {/* Header with name */}
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="font-semibold text-base">{region.displayName}</span>
                              </div>

                              {/* Price display */}
                              <div className={`rounded-lg p-2 text-center ${region.isPinned ? "bg-indigo-100" : region.isUserAdded ? "bg-sky-100" : "bg-slate-100"}`}>
                                <div className="font-bold text-2xl" style={{ color: "#00f" }}>
                                  ${regionData[region.key].priceUSD.toFixed(2)}
                                </div>
                                <div className="text-muted-foreground text-xs">per kWh (USD)</div>
                              </div>

                              {/* Energy Sources Chart */}
                              <EnergyBreakdown energyMix={regionData[region.key].energyMix} compact={true} />

                              {/* Data Sources */}
                              <div className="border-t pt-1 flex gap-3 text-xs text-muted-foreground">
                                <a
                                  href={regionData[region.key].priceSourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline truncate"
                                >
                                  Price: {regionData[region.key].priceSource}
                                </a>
                                <a
                                  href={regionData[region.key].energySourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline truncate"
                                >
                                  Mix: {regionData[region.key].energySource}
                                </a>
                              </div>
                            </div>

                            {/* Columns 2, 3, 4: Factor Scores or Skeleton Loading */}
                            {isAnalyzing ? (
                              // Skeleton shimmer loading state
                              <>
                                {[0, 1, 2].map((idx) => (
                                  <div key={idx} className="flex flex-col items-center justify-start gap-2 pt-10">
                                    <Skeleton className="w-10 h-10 rounded-full" />
                                    <div className="space-y-2 w-full">
                                      <Skeleton className="h-3 w-full" />
                                      <Skeleton className="h-3 w-4/5 mx-auto" />
                                      <Skeleton className="h-3 w-3/5 mx-auto" />
                                    </div>
                                  </div>
                                ))}
                              </>
                            ) : !lastAnalyzedRegions.includes(region.key) ? (
                              // Placeholder for newly added regions (not yet analyzed)
                              [0, 1, 2].map((idx) => (
                                <div key={idx} className="flex flex-col items-center justify-start gap-2 pt-10">
                                  <div className="w-10 h-10 rounded-full bg-slate-200" />
                                  <div className="space-y-2 w-full">
                                    <div className="h-3 w-full rounded bg-slate-200" />
                                    <div className="h-3 w-4/5 mx-auto rounded bg-slate-200" />
                                    <div className="h-3 w-3/5 mx-auto rounded bg-slate-200" />
                                  </div>
                                </div>
                              ))
                            ) : (
                              // Actual factor scores
                              analysis?.scoreTable?.slice(0, 3).map((row, factorIdx) => {
                                const score = row.scores[region.displayName] ?? row.scores[region.key] ?? 0
                                const justification = row.justifications?.[region.displayName] ?? row.justifications?.[region.key] ?? ""

                                return (
                                  <div key={factorIdx} className="flex flex-col items-center justify-start gap-2 pt-10">
                                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold ${score === 1 ? "bg-green-100 text-green-700" :
                                        score === -1 ? "bg-red-100 text-red-700" :
                                          "bg-gray-100 text-gray-600"
                                      }`}>
                                      {score > 0 ? `+${score}` : score}
                                    </span>
                                    {justification && (
                                      <p className="text-center text-foreground text-sm pt-4">{justification}</p>
                                    )}
                                  </div>
                                )
                              })
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                })()}
              </div>

              {/* Full Analysis Button - Desktop */}
              {!isAnalyzing && analysis?.scoreTable && !showFullAnalysis && (
                <div className="hidden lg:flex justify-start mt-6">
                  <Button
                    variant="outline"
                    onClick={loadFullAnalysis}
                    disabled={isLoadingFullAnalysis}
                    className="gap-2 bg-transparent"
                  >
                    {isLoadingFullAnalysis ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        Full Analysis
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Factor Analysis Paragraphs - Desktop */}
              {!isAnalyzing && showFullAnalysis && analysis?.factorAnalyses && analysis.factorAnalyses.length > 0 && (
                <div className="hidden lg:block mt-6 space-y-4">
                  <h4 className="font-semibold text-lg">Detailed Factor Analysis</h4>
                  {analysis.factorAnalyses.map((factor, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-4">
                        <h5 className="mb-2 font-semibold">{factor.factor}</h5>
                        <p className="text-sm leading-relaxed text-foreground">{factor.analysis}</p>
                        {factor.sources && factor.sources.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {factor.sources.map((source, sIdx) => (
                              <a
                                key={sIdx}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                [{source.label}]
                              </a>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Synthesis Summary - Desktop */}
              {!isAnalyzing && showFullAnalysis && analysis?.synthesis && (
                <Card className="hidden md:block bg-slate-50 mt-4">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Summary</h4>
                    <p className="text-sm text-foreground">{analysis.synthesis}</p>
                    {analysis.synthesisSources && analysis.synthesisSources.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {analysis.synthesisSources.map((source, idx) => (
                          <a
                            key={idx}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            [{source.label}]
                          </a>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </LayoutGroup>

        {/* Search Dialog for Expanded View */}
        <Dialog open={isSearchOpen} onOpenChange={(open) => {
          setIsSearchOpen(open)
          if (!open) setDialogSearchValue("")
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add a State</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="Search for a US state..."
                  value={dialogSearchValue}
                  onChange={(e) => setDialogSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    const dialogSuggestions = dialogSearchValue
                      ? Object.keys(regionData)
                        .filter(
                          (key) => key.toLowerCase().includes(dialogSearchValue.toLowerCase()) &&
                            !filteredStates.some((s) => s.key === key) &&
                            !userAddedRegions.some((r) => r.key === key),
                        )
                        .slice(0, 6)
                      : []
                    if (e.key === "Enter" && dialogSuggestions.length > 0) {
                      addRegion(dialogSuggestions[0])
                      setDialogSearchValue("")
                      setIsSearchOpen(false)
                    }
                  }}
                  autoFocus
                />
              </div>
              {dialogSearchValue && (
                <div className="flex flex-wrap gap-2">
                  {Object.keys(regionData)
                    .filter(
                      (key) => key.toLowerCase().includes(dialogSearchValue.toLowerCase()) &&
                        !filteredStates.some((s) => s.key === key) &&
                        !userAddedRegions.some((r) => r.key === key),
                    )
                    .slice(0, 6)
                    .map((key) => (
                      <Badge
                        key={key}
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80"
                        onClick={() => {
                          addRegion(key)
                          setDialogSearchValue("")
                          setIsSearchOpen(false)
                        }}
                      >
                        {key
                          .split(" ")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")}
                      </Badge>
                    ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Mobile Region Detail Sheet */}
        <Sheet open={!!mobileDetailRegion} onOpenChange={(open) => !open && setMobileDetailRegion(null)}>
          <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
            {mobileDetailRegion && (() => {
              const regionKey = mobileDetailRegion
              const data = regionData[regionKey]
              if (!data) return null

              const displayName = regionKey.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
              const isPinned = pinnedRegions.has(regionKey)
              const isUserAdded = userAddedRegions.some((r) => r.key === regionKey)
              const isAnalyzed = lastAnalyzedRegions.includes(regionKey)

              return (
                <>
                  <SheetHeader className="pb-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <SheetTitle className="flex items-center gap-2">
                          {isPinned && <Pin className="h-4 w-4 fill-current text-indigo-600" />}
                          {displayName}
                        </SheetTitle>
                        <div className="text-2xl font-bold text-primary mt-1">
                          ${data.priceUSD.toFixed(2)}/kWh
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => togglePinRegion(regionKey)}
                          disabled={isAnalyzing}
                        >
                          <Pin className={`h-4 w-4 mr-1 ${isPinned ? "fill-current" : ""}`} />
                          {isPinned ? "Unpin" : "Pin"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            isUserAdded ? removeUserRegion(regionKey) : hideFilterRegion(regionKey)
                            setMobileDetailRegion(null)
                          }}
                          disabled={isAnalyzing}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </SheetHeader>

                  <div className="py-4 space-y-4">
                    {/* Electricity Sources */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Electricity Sources</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(data.energyMix)
                          .filter(([, v]) => v > 0)
                          .sort((a, b) => b[1] - a[1])
                          .map(([source, pct]) => (
                            <Badge key={source} variant="secondary" className="text-xs">
                              {source.charAt(0).toUpperCase() + source.slice(1)} {pct}%
                            </Badge>
                          ))}
                      </div>
                    </div>

                    {/* Factor Scores */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3">Price Driver Scores</h4>
                      {isAnalyzing ? (
                        <div className="space-y-3">
                          {[0, 1, 2].map((i) => (
                            <div key={i} className="p-3 rounded-lg border">
                              <Skeleton className="h-5 w-32 mb-2" />
                              <Skeleton className="h-8 w-8 rounded-full mb-2" />
                              <Skeleton className="h-12 w-full" />
                            </div>
                          ))}
                        </div>
                      ) : !isAnalyzed ? (
                        <p className="text-sm text-muted-foreground p-3 bg-slate-50 rounded-lg">
                          This region was not included in the current analysis. Tap "Refactor Price Drivers" to include it.
                        </p>
                      ) : analysis?.scoreTable?.slice(0, 3).map((factor, idx) => {
                        const score = factor.scores[displayName] ?? factor.scores[regionKey] ?? 0
                        const justification = factor.justifications?.[displayName] || factor.justifications?.[regionKey]

                        return (
                          <div key={idx} className="p-3 rounded-lg border mb-3">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h5 className="font-medium text-sm">{factor.factor}</h5>
                              <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${score === 1 ? "bg-green-100 text-green-700" :
                                  score === -1 ? "bg-red-100 text-red-700" :
                                    "bg-gray-100 text-gray-600"
                                }`}>
                                {score > 0 ? `+${score}` : score}
                              </div>
                            </div>
                            {justification && (
                              <p className="text-sm text-muted-foreground">{justification}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              )
            })()}
          </SheetContent>
        </Sheet>
      </div>{/* End scrollable content */}
    </div>
  )
}
