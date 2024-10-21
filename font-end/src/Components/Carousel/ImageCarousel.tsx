import React, { useState, useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { IconChevronCompactLeft, IconChevronCompactRight } from '@tabler/icons-react'

interface CarouselProps {
    images: Array<{
        path: string;
        id: string | number;
    }>;
}

const ProductImageCarousel: React.FC<CarouselProps> = ({ images }) => {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [mainViewportRef, embla] = useEmblaCarousel({ skipSnaps: false })
    const [thumbViewportRef, emblaThumbs] = useEmblaCarousel({
        containScroll: 'keepSnaps',
        dragFree: true,
    })

    const onThumbClick = useCallback(
        (index: number) => {
        if (!embla || !emblaThumbs) return
        embla.scrollTo(index)
        },
        [embla, emblaThumbs]
    )

    const onSelect = useCallback(() => {
        if (!embla || !emblaThumbs) return
        setSelectedIndex(embla.selectedScrollSnap())
        emblaThumbs.scrollTo(embla.selectedScrollSnap())
    }, [embla, emblaThumbs])

    useEffect(() => {
        if (!embla) return
        onSelect()
        embla.on('select', onSelect)
        return () => embla.off('select', onSelect)
    }, [embla, onSelect])

    if (!images || images.length === 0) {
        return null
    }

    return (
        <div className="w-full max-w-[600px]">
        {/* Main Carousel */}
        <div className="relative">
            <div className="overflow-hidden rounded-lg" ref={mainViewportRef}>
            <div className="flex touch-pan-y">
                {images.map((image, index) => (
                <div className="relative flex-[0_0_100%] min-w-0" key={image.id}>
                    <div className="aspect-[4/3] w-full">
                    <img
                        className="w-full h-full object-contain"
                        src={image.path}
                        alt={`Product image ${index + 1}`}
                    />
                    </div>
                </div>
                ))}
            </div>
            </div>

            {/* Navigation Buttons */}
            <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4 -translate-y-1/2 pointer-events-none">
            <button
                className="w-10 h-10 flex items-center justify-center bg-white/80 rounded-full shadow-md hover:bg-white pointer-events-auto"
                onClick={() => embla?.scrollPrev()}
            >
                <IconChevronCompactLeft className="w-6 h-6" />
            </button>
            <button
                className="w-10 h-10 flex items-center justify-center bg-white/80 rounded-full shadow-md hover:bg-white pointer-events-auto"
                onClick={() => embla?.scrollNext()}
            >
                <IconChevronCompactRight className="w-6 h-6" />
            </button>
            </div>

            {/* Dots */}
            <div className="absolute bottom-4 left-0 right-0">
            <div className="flex justify-center gap-2">
                {images.map((_, index) => (
                <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                    index === selectedIndex ? 'bg-white w-4' : 'bg-white'
                    }`}
                    type="button"
                    onClick={() => embla?.scrollTo(index)}
                />
                ))}
            </div>
            </div>
        </div>

        {/* Thumbnails */}
        <div className="mt-4">
            <div className="overflow-hidden" ref={thumbViewportRef}>
            <div className="flex gap-2">
                {images.map((image, index) => (
                <button
                    key={image.id}
                    className={`relative flex-[0_0_20%] min-w-0 cursor-pointer rounded-md overflow-hidden transition-all ${
                    index === selectedIndex
                        ? 'ring-3 ring-gray-200'
                        : 'ring-3 ring-gray-200'
                    }`}
                    type="button"
                    onClick={() => onThumbClick(index)}
                >
                    <div className="aspect-[4/3] w-full">
                    <img
                        className="w-full h-full object-cover"
                        src={image.path}
                        alt={`Thumbnail ${index + 1}`}
                    />
                    </div>
                </button>
                ))}
            </div>
            </div>
        </div>
        </div>
    )
}

export {
        ProductImageCarousel
}