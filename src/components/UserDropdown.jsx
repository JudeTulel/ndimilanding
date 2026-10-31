import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import NavItems from "./NavItems";

const UserDropdown = () => {
  const [open, setOpen] = useState(false);
  const arrowRef = useRef(null);
  const menuRef = useRef(null);
  const tlRef = useRef(null);

  // exit speed (matches the demo's slider default)
  const EXIT_TS = 2.5;

  useEffect(() => {
    const arrow = arrowRef.current;
    const menu = menuRef.current;
    if (!arrow || !menu) return;

    gsap.set(menu, { autoAlpha: 0, yPercent: -30, scale: 0.7 });
    gsap.set(arrow, { rotation: 0 });
    gsap.set(".user-dd-item", { opacity: 1, x: 0 });

    const tl = gsap.timeline({ paused: true });

    tl.to(
      arrow,
      {
        rotation: 180,
        duration: 0.9,
        ease: "elastic.out(1.2, 0.3)",
        easeReverse: "power2.inOut",
      },
      0,
    )
      .to(
        menu,
        {
          autoAlpha: 1,
          yPercent: 0,
          scale: 1,
          duration: 1,
          ease: "elastic.out(1.2, 0.3)",
          easeReverse: "power3.out",
        },
        0,
      )
      .from(
        ".user-dd-item",
        {
          opacity: 0,
          x: -20,
          duration: 0.5,
          ease: "back.out(3)",
          easeReverse: "power2.out",
          stagger: 0.07,
        },
        0.1,
      );

    tlRef.current = tl;
    return () => {
      tl.kill();
      tlRef.current = null;
    };
  }, []);

  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;
    if (open) {
      tl.timeScale(1).play();
    } else {
      tl.timeScale(EXIT_TS).reverse();
    }
  }, [open]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="orange-btn flex items-center gap-2 px-4 text-sulphur hover:bg-red hover:text-dark border-2 border-red rounded-lg"
            render={
              <button>
                <span className="hidden md:inline font-quick font-bold">
                  Ndimi AI
                </span>
                <ChevronDown
                  ref={arrowRef}
                  className="h-4 w-4"
                  style={{ transformOrigin: "center center" }}
                />
              </button>
            }
          />
        }
      />

      <DropdownMenuContent
        ref={menuRef}
        align="end"
        className="w-56 bg-dark border-2 border-red text-sulphur rounded-lg shadow-[6px_6px_0_var(--color-red)] overflow-hidden"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="user-dd-item font-bungee uppercase text-red">
            Ndimi AI
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-red/40" />

        {/* Mobile Navigation Items */}
        <div className="md:hidden px-2 py-1 user-dd-item">
          <NavItems />
          <DropdownMenuSeparator className="bg-red/40" />
        </div>

        <DropdownMenuItem className="user-dd-item font-quick font-bold text-sulphur focus:bg-red focus:text-dark transition-colors cursor-pointer">
          <a
            href="https://ystudios.co.ke"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            Ystudios.co.ke
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
