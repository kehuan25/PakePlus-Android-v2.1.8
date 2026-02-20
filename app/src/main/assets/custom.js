window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});// very important, if you don't know what it is, don't touch it
// 非常重要，不懂代码不要动，这里可以解决80%的问题，也可以生产1000+的bug
const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector(
        'head base[target="_blank"]'
    )
    console.log('origin', origin, isBaseTargetBlank)
    if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
    ) {
        e.preventDefault()
        console.log('handle origin', origin)
        location.href = origin.href
    } else {
        console.log('not handle origin', origin)
    }
}

window.open = function (url, target, features) {
    console.log('open', url, target, features)
    location.href = url
}

document.addEventListener('click', hookClick, { capture: true })

// ========== 新增：安全区域适配 ==========
(function fixSafeArea() {
    // 1. 确保 viewport 设置了 viewport-fit=cover
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
        let content = viewport.getAttribute('content') || '';
        if (!content.includes('viewport-fit=')) {
            content += ', viewport-fit=cover';
            viewport.setAttribute('content', content);
        }
    } else {
        // 如果没有 viewport，创建一个
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
        document.head.appendChild(meta);
    }

    // 2. 动态添加安全区域样式
    const style = document.createElement('style');
    style.innerHTML = `
        body {
            padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        /* 如果只希望计算器容器底部留白，可以改用下面的规则 */
        /* .calculator {
            padding-bottom: env(safe-area-inset-bottom, 0px);
        } */
    `;
    document.head.appendChild(style);

    // 3. 后备方案：如果 env() 不支持，通过 JS 获取安全区域高度并设置
    // 部分 WebView 可能不支持 env，但可以通过计算 window.innerHeight 与 document.documentElement.clientHeight 的差值来估算
    function fallbackPadding() {
        // 如果已经通过 env 设置了样式，理论上不需要后备，但为了兼容老版本，可以计算一次
        const computed = window.getComputedStyle(document.body);
        if (computed.paddingBottom === '0px') {
            // 可能 env 未生效，尝试手动调整
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.clientHeight;
            // 虚拟导航栏高度通常为 windowHeight - documentHeight 的正值
            const navBarHeight = Math.max(0, windowHeight - documentHeight);
            if (navBarHeight > 0) {
                document.body.style.paddingBottom = navBarHeight + 'px';
            }
        }
    }

    // 在页面加载完成后执行一次
    window.addEventListener('load', fallbackPadding);
    // 同时监听 resize，因为横竖屏切换可能改变安全区域
    window.addEventListener('resize', fallbackPadding);
    // 立即执行一次（如果 DOM 已就绪）
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        fallbackPadding();
    } else {
        document.addEventListener('DOMContentLoaded', fallbackPadding);
    }
})();